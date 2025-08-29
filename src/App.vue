<script  lang="ts">

import SudokuMenubar from './components/SudokuMenubar.vue'
import SudokuControls from './components/SudokuControls.vue'
import { vueWindowSizeMixin } from 'vue-window-size/mixin';
import SudokuBoard from './components/SudokuBoard.vue';
import 'primeicons/primeicons.css';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
let example0 = '000000160000900005430020000001000040600050030008100007070000002590270000000000050';  // NYT 08.12.2023
let example1 = '800001425000020000000800000000000080060000203000783001006310000490000000073290006';  // NYT 10.12.2023 Hard

function convertIntialState(s: string) : number[] 
{
  var ret : number[] = [];
  for (const c of s)
    ret.push(parseInt(c));
  return ret;
}

export default {
  mixins: [vueWindowSizeMixin()],
  data() {
    return {
      mode: 1,
      autoCandidateMode: false,
      seedMode: false,
    };
  },
  components: {
    SudokuControls,
    SudokuBoard,
    SudokuMenubar,
  },
  computed: {
    availableBoardWidth() {
      var ret = this.$windowWidth - 64;
            // 64 = 2rem + 2rem = app padding left + app padding right
      if (this.$windowWidth > 820) {
        ret = ret - (240 + 40);
              // 240 = width of sudoku controls panel, 
              // 40 = margin between sudoku board and sudoku controls
      };
      ret = Math.min(ret, 566);
      ret = Math.max(ret, 459-64);
      return ret;
    },
    initialized(): boolean {
      const sudokuBoard = this.$refs.SudokuBoard as typeof SudokuBoard;
//      const sudokuMenuBar = this.$refs.SudokuMenubar as typeof SudokuMenubar;
      return sudokuBoard !== undefined && sudokuBoard.initialized;
    },
  },
  methods: {
    keyPressed(o: any) {
      console.log('keyPressed', o);
      (this.$refs.SudokuBoard as typeof SudokuBoard).keyPressed(o.key);
    },
    setMode(mode:number) {
      this.mode = mode;
      console.log ('modeChange', mode);
    },
    setAutoCandidateMode(autoCandidateMode: boolean) {
      this.autoCandidateMode = autoCandidateMode;
      console.log('autoCandidateModeChange', autoCandidateMode);
    },
    onKeyDownEvent(keyboardEvent: KeyboardEvent) {
      console.log(keyboardEvent);
      if (keyboardEvent.key >= '1' && keyboardEvent.key <= '9') {
        this.keyPressed({ key: +keyboardEvent.key, mode: this.mode });
      };
      if (keyboardEvent.key == 'x' || keyboardEvent.key == '0') {
        this.keyPressed({ key: 0, mode: this.mode });
      };
      if (keyboardEvent.key == 'ArrowLeft') {
        var focus = (this.$refs.SudokuBoard as typeof SudokuBoard).focus;
        if (focus.col > 0) {
          focus.col -= 1;
          (this.$refs.SudokuBoard as typeof SudokuBoard).focusRequest(focus);
        };
      };
      if (keyboardEvent.key == 'ArrowRight') {
        focus = (this.$refs.SudokuBoard as typeof SudokuBoard).focus;
        if (focus.col < 8) {
          focus.col += 1;
          (this.$refs.SudokuBoard as typeof SudokuBoard).focusRequest(focus);
        };
      };
      if (keyboardEvent.key == 'ArrowUp') {
        focus = (this.$refs.SudokuBoard as typeof SudokuBoard).focus;
        if (focus.row > 0) {
          focus.row -= 1;
          (this.$refs.SudokuBoard as typeof SudokuBoard).focusRequest(focus);
        };
      };
      if (keyboardEvent.key == 'ArrowDown') {
        focus = (this.$refs.SudokuBoard as typeof SudokuBoard).focus;
        if (focus.row < 8) {
          focus.row += 1;
          (this.$refs.SudokuBoard as typeof SudokuBoard).focusRequest(focus);
        };
      };
      if (keyboardEvent.key == 'n' || keyboardEvent.key == 'N') {
        (this.$refs.SudokuControls as typeof SudokuControls).setNormalMode();
      };
      if (keyboardEvent.key == 'c' || keyboardEvent.key == 'C') {
        (this.$refs.SudokuControls as typeof SudokuControls).setCandidateMode();
      };
      if (keyboardEvent.key == ' ' || keyboardEvent.key == 'a') {
        (this.$refs.SudokuControls as typeof SudokuControls).toggleAutoCandidateMode();
      };
    },
    seedModeChanged(seedMode: boolean) {
      console.log('seedModeChanged', seedMode);
      if (seedMode) {
        this.seedMode = seedMode;
        (this.$refs.SudokuMenubar as typeof SudokuMenubar).stopElapsedSecondsTimer();
        (this.$refs.SudokuBoard as typeof SudokuBoard).enterSeedMode();
      }
      else {
        var ok: boolean = (this.$refs.SudokuBoard as typeof SudokuBoard).leaveSeedMode();
        this.seedMode = seedMode;
        if (ok) {
          (this.$refs.SudokuMenubar as typeof SudokuMenubar).elapsedSeconds = 0;
        };
        (this.$refs.SudokuMenubar as typeof SudokuMenubar).startElapsedSecondsTimer();
      }
      (this.$refs.SudokuMenubar as typeof SudokuMenubar).seedMode = this.seedMode;
    },
    newSudokuReady(initialValue: number[], solutionValue: number[])
    {
        (this.$refs.SudokuMenubar as typeof SudokuMenubar).stopElapsedSecondsTimer();
        (this.$refs.SudokuBoard as typeof SudokuBoard).initializeBoard(initialValue, solutionValue);
        (this.$refs.SudokuMenubar as typeof SudokuMenubar).startElapsedSecondsTimer();
    }
  },
  mounted() {
    const na = convertIntialState(example1);
    const sudokuBoard = this.$refs.SudokuBoard as typeof SudokuBoard;
    (sudokuBoard).initializeBoard(na, sudokuBoard.checkForUniqueSolution(na));
  },
};

</script>


<template>
  <div class="page-container" tabindex="0" @keydown="onKeyDownEvent">
    <SudokuMenubar :initialized="true" ref="SudokuMenubar"
      @seedModeChanged="seedModeChanged"
      @newSudokuReady="newSudokuReady"
    />
    <div class="su-container" >
      <SudokuBoard ref="SudokuBoard" 
        :available_width="availableBoardWidth" 
        :mode="mode"
        :autoCandidateMode="autoCandidateMode"
        :seedMode="seedMode"
      />
      <SudokuControls ref="SudokuControls"
          @keyPressed="keyPressed" 
          @modeChange="setMode" 
          @autoCandidateModeChange="setAutoCandidateMode"
      />
    </div>
    <div class="debug">
      <hr>
      availableBoardWith={{ availableBoardWidth }}<br>
      windowWidth={{ $windowWidth }}<br>
      <span class="pi pi-check"></span>
    </div>
  </div>
</template>


<style scoped>

.page-container:focus {
   outline: none;
}

.debug {
  margin-top: 1rem;
}


@media (width > 820px) {

.su-container {
  display: flex;
  flex-direction: row;
  margin-top: 20px;
  justify-content: space-between;
}

}

@media (width <= 820px) {

.su-container {
  display: flex;
  flex-direction: column;
  margin-top: 20px;
  align-items: center;
}

}

</style>
