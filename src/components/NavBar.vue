<template>
  <div class="navbar">
    <div class="navbar-container">
      <div class="navbar-brand">Sudoku</div>
      <div class="navbar-collapse">
        <ul class="navbar-nav">
          <li class="navbar-item" :class="{active: seedMode}" @click="toggleSeedMode()">Seed</li>
          <li class="navbar-item" :class="{active: false}" @click="genNewSudoku()">Generate</li>
         </ul>
        <div class="StatusIndications">
          <div class="TimerIndication">{{ elapsed_HHMMSS }}</div>
          <div class="SolutionUniqeIndication">
            <svg viewBox="0 0 100 100" width="32" height="32">
              <circle cx="50" cy="50" r="40" fill="#e6e6e6" />
            </svg>
            <div><span class="pi pi-times"></span></div>
          </div>
        </div>
      </div>
    </div>
  </div> 
</template>

<style scoped>

.navbar {
  display: flex;
  flex-wrap: nowrap;
  position: relative;
  margin: 0;
  padding: 0.5rem 0;
  align-items: center;
  background-color: rgb(33, 37, 41);
  border-radius: 0.375rem;
}

.navbar-container {
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  justify-content: space-between;
  padding: 0 0.75rem;
  width: 100%;
}

.navbar-brand{
  padding: 0.3125rem 0;
  color: #fff;
  font-size: 1.25rem;
  text-decoration: none;
  white-space: nowrap;
  margin-right: 1rem;  
}

.navbar-collapse {
  display:flex;
  flex-basis: auto;
  align-items: center;
  justify-content: space-between;
  flex-grow: 1;
}

.navbar-nav {
  list-style: none;
  display: block;
  margin-bottom: 0.5rem;
  margin-top: 0;
  margin-right: 1rem;
  margin-left: 0;;
  display: flex;
  padding: 0;
}

.navbar-item {
  display: block;
  color: #fff;
  font-size: 16px;
  font-weight: 400;
  padding: 0.5rem;
  opacity: 0.55;
}

.navbar-item:hover {
  opacity: 0.75;
}

.navbar-item.active {
  opacity: 1.0;
  text-decoration: underline;
}

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
  color: red;
  display: flex;
  justify-content:center;
  align-items: center;
}

</style>

<script lang="ts">

export default {
    name: 'NavBar',
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
      };
    },
    computed: {
      elapsed_HHMMSS(): string {
        const date: Date = new Date();
        date.setUTCHours(0);
        date.setMinutes(0);
        date.setSeconds(this.elapsedSeconds);
        const result: string = date.toISOString().slice(11, 19);
        return result;        
      }
    },
    methods: {
      toggleSeedMode() {
        this.$emit('seedModeChanged', !this.seedMode);
      },
      startElapsedSecondsTimer () {
        this.elapsedSecondsTimerId = setInterval(() => this.elapsedSeconds += 1, 1000);
      },
      stopElapsedSecondsTimer() {
        clearInterval(this.elapsedSecondsTimerId);
        this.elapsedSecondsTimerId = 0;
      },
      genNewSudoku() {

      }
    },
    mounted() {
      this.startElapsedSecondsTimer();
    }
};

</script>