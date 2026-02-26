
<template>
    <div class="card">
        <Menubar :model="items">
            <template #start>
                <div class="text-xl font-bold px-3">Sudoku</div>
            </template>
            <template #end>
                <div v-show="mode==1" class="StatusIndications">
                    <div class="TimerIndication">{{ elapsed_HHMMSS }}</div>
                    <div class="SolutionUniqeIndication">
                        <svg viewBox="0 0 100 100" width="32" height="32">
                        <circle cx="50" cy="50" r="40" fill="#e6e6e6" />
                        </svg>
                        <div><span class="pi" :class="statusIcon" :style="statusIconStyle"></span></div>
                    </div>
                </div>
            </template>
        </Menubar>
    </div>
</template>

<style scoped>

.StatusIndications {
  display: flex;
  color: #fff;
}

.TimerIndication {
  display: block;
  position: relative;
  padding: 0.5rem;
  background-color: #fff;
  border-radius: 0.5rem;
  color:black;
  opacity: 0.35;
  margin-bottom: 0.25rem;
  margin-top: 0.25rem;
}

.SolutionUniqeIndication {
  display:block;
  position: relative;
  width: 3rem;
  height: 3rem;
  padding: 0.5rem;
  color: #e6e6e6;
}

.SolutionUniqeIndication svg {
  position: absolute
}
.SolutionUniqeIndication div {
  position: absolute;
  width: 32px;
  height: 32px;
  display: flex;
  justify-content:center;
  align-items: center;
}

</style>

<script lang="ts">

import Menubar from 'primevue/menubar'
import 'primeicons/primeicons.css'
import { getSudoku } from 'sudoku-gen';
import type { Difficulty } from 'sudoku-gen/dist/types/difficulty.type';
import { file } from '@primeuix/themes/aura/fileupload';

declare global {
  interface Window {
    showOpenFilePicker(pickerOpts: any): Promise<FileSystemFileHandle[]>;
  }
}

const pickerOpts = {
  types: [
    {
      description: "Images",
      accept: {
        "image/*": [".png", ".gif", ".jpeg", ".jpg"],
      },
    },
  ],
  excludeAcceptAllOption: true,
  multiple: false,
};

export default {
    name: 'SudokuMenubar',
    components: {
        Menubar,
    },
    props: {
      initialized: {
        type: Boolean,
        required: true,
      },
    }, 
    data() {
        return {
            seedMode: false,
            elapsedSeconds : 0,
            elapsedSecondsTimerId : 0,
            solvable : true,
            solved : false,
            mode : 1,
            items : [
                {
                    label: 'Seed',
                    icon: 'pi pi-calculator',
                    command: () => {
                        this.$emit('seedModeChanged', !this.seedMode);
                    }
                },
                {
                    label: 'Generate-New',
                    icon: 'pi pi-plus',
                    items: [
                        {
                            label: 'Easy',
                            icon: 'pi pi-bolt',
                            command: () => { (this.genNewSudoku as Function)('easy')}
                        },
                        {
                            label: 'Medium',
                            icon: 'pi pi-server',
                            command: () => { (this.genNewSudoku as Function)('medium')}
                        },
                        {
                            label: 'Hard',
                            icon: 'pi pi-pencil',
                            command: () => { (this.genNewSudoku as Function)('hard')}
                        },
                        {
                            label: 'Expert',
                            icon: 'pi pi-pencil',
                            command: () => { (this.genNewSudoku as Function)('expert')}
                        }
                    ]
                },
                {
                  label: "New-from-Image",
                  icon: 'pi pi-database',
                  items: [
                    {
                      label: 'From-File',
                      icon: 'pi pi-image',
                      command: async () => {
                        try {
                          const [filehandle] = await window.showOpenFilePicker(pickerOpts);
                          if (!filehandle) {
                            console.error('No file selected');
                            return;
                          }
                          const file = await filehandle.getFile();
                          console.log('Selected file:', file.name);
                          this.$emit('newFromFileActive', true, filehandle, null);
                        } catch (error) {
                          console.error('File picker cancelled or error:', error);
                        }
                      },
                    },
                    {
                      label: 'From-Camera',
                      icon: 'pi pi-camera',
                      command: () => { 
                        console.log("Not implemented yet");
                      },
                    }
                  ]
                },
            ]
        }
    },
    computed: {
      elapsed_HHMMSS(): string {
        const date: Date = new Date();
        date.setUTCHours(0);
        date.setMinutes(0);
        date.setSeconds(this.elapsedSeconds);
        const result: string = date.toISOString().slice(11, 19);
        return result;        
      },
      statusIcon()
      {
        return {
          'pi-check': this.solved,
          'pi-times': !this.solvable,
          'pi-spin pi-spinner': this.solvable && !this.solved
        }
      },
      statusIconStyle()
      {
        if (this.solved) {
          return {color: 'green', 'font-weight': 'bold'};
        }
        else if (!this.solvable) {
          return {color: 'red', 'font-weight': 'bold'}
        }
        else {
          return { color: 'black', 'font-weight': 'bold'}
        }
      },
    },
    methods: {
      toggleSeedMode() {
        this.$emit('seedModeChanged', !this.seedMode);
      },
      startElapsedSecondsTimer () {
        this.elapsedSecondsTimerId = setInterval(() => this.elapsedSeconds += 1, 1000);
        console.log('ElapsedSecondsTimer started');
      },
      stopElapsedSecondsTimer() {
        clearInterval(this.elapsedSecondsTimerId);
        this.elapsedSecondsTimerId = 0;
        console.log('ElapsedSecondsTimer stopped');
      },
      genNewSudoku(difficulty : Difficulty) {
        const sudoku = getSudoku(difficulty);
        var initialstate : number[] = [];
        var solutionstate : number[] = [];
        for (var i=0; i < 81; i++ ) {
          const ci : string = sudoku.puzzle.charAt(i);
          const ni : number = (ci == '-' ? Number(0) : Number(ci))
          initialstate.push(ni);
          const cs : string = sudoku.solution.charAt(i);
          const ns : number = (cs == '-' ? Number(0) : Number(cs))
          solutionstate.push(ns);
        }
        this.elapsedSeconds = 0;
        this.$emit('newSudokuReady', initialstate, solutionstate);
      },
      updateStatus (solvable:boolean, solved:boolean)
      {
        this.solvable = solvable;
        this.solved = solved;
        if (solved) {
          this.stopElapsedSecondsTimer();
        }
        console.log(this.solvable, this.solved);
      }
    },
    mounted() {
      this.startElapsedSecondsTimer();
    }

}

</script>
