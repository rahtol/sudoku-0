<script lang="ts">

export default {
    props: {
        id: {
            type: String,
            required: true,
        },
        row: {
            type: Number,
            required: true,
        },
        col: {
            type: Number,
            required: true,
        },
        size: {  // width and height of cell in px
            type: Number,
            required: true,
        },
        mode: {
            type: Number,
            required: true
        },
        hasFocus: {
            type: Boolean,
            required: true,
        },
        autoCandidateMode: {
            type: Boolean,
            required: true,
        },
    },
    data() {
        return {
            initialValue: 0,
            value: 0,
            candidates: 0,  // bitlist of lenght 9 starting at bit 1
            autoCandidatesCalculated : 0,
            autoCandidatesManuallyExcluded : 0,
            hasConflict : false, // is the current cell value in conflict with another cell value
        };
    },
    computed: {
        autoCandidates() {
            return this.autoCandidatesCalculated & ~this.autoCandidatesManuallyExcluded;
        }
    },
    methods: {
        focusRequest () {
            if (!this.hasFocus) {
                var focus = { row : this.row, col: this.col };
                console.log('focusRequest', focus);
                this.$emit('focusRequest', focus);
            }
        },
        keyPressed(n: number) {
            console.log(`row=${this.row}, col=${this.col}, key=${n}`);
            
            // no input on initial cells 
            if (this.isInitialCell()) {
                return;
            }

            if (this.mode == 1 || n == 0) {
                // applies also for delete, which is represented by zero
                // delete key operates independant from mode, i.e. also in candidate mode 
                this.value = n;
                this.$emit('stateChanged', {row: this.row, col: this.col, value: this.value})
            }
            if (this.mode == 2 && this.value == 0 && n != 0) {
                // candidate editing possible in candidate mode only and
                // candidate editing requires the cell having no value
                this.toggleCandidate(n);
            }
        },
        setCandidate(n:number) {
            if(this.autoCandidateMode) {
                this.autoCandidatesManuallyExcluded &= ~(1 << n);  // inverted logic, excluded bits rescorded
            }
            else {
                this.candidates |= (1 << n);
            }
        },
        resetCandidate(n:number) {
            if(this.autoCandidateMode) {
                this.autoCandidatesManuallyExcluded |= (1 << n);  // inverted logic, excluded bits rescorded
            }
            else {
                this.candidates &= ~(1 << n);
            }
        },
        isCandidateSet(n:number) : boolean {
            return (((this.autoCandidateMode) ? this.autoCandidates : this.candidates) & (1 << n)) != 0;
        },
        toggleCandidate(n:number) {
            if (this.isCandidateSet(n)) {
                this.resetCandidate(n);
            }
            else {
                this.setCandidate(n);
            }
        },
        calcFontsizeNormalMode() : string {
            return Math.floor(this.size * 0.60) + 'px';
        },
        calcFontsizeCandidateMode() : string {
            return Math.floor(this.size * 0.20) + 'px';
        },
        isInitialCell() : boolean {
            // initial cells are those that are given at start of game and cannot be changed during the game
            return this.initialValue != 0;
        },
        initializeCell(n: number) {
            this.initialValue = n;
            this.value = n;
            this.candidates = 0;
            this.autoCandidatesCalculated = 1022;
            this.autoCandidatesManuallyExcluded = 0;
            this.hasConflict = false;
        },
    }
}

</script>

<template>
    <div class="su-cell" :class="{ hasFocus: hasFocus, initialCell: isInitialCell() }" @click="focusRequest()">
        <div class="mode1" v-show="value != 0">
            <span v-if="value != 0">{{ value }}</span>
        </div>
        <div class="mode2" v-show="value == 0">
            <template v-for="i in 9" :key="i">
                <div class="candidate-cell" :class="{candidateSet: isCandidateSet(i)}" @click="hasFocus && toggleCandidate(i)">
                    <span>{{i}}</span>
                </div>
            </template>
        </div>
        <div class="conflictIndicator" v-show="hasConflict">
        </div>
    </div>
</template>

<style scoped>

.su-cell {
    position: absolute;
    min-width: v-bind(size+'px');
    min-height: v-bind(size+'px');
    max-width: v-bind(size+'px');
    max-height: v-bind(size+'px');
    background-color: #fff;
    text-align: center;
}

.su-cell span {
    display: inline-block;
    text-align: center;
    padding-inline: 6px;
    padding-block: 0px;
    font-weight: 600;
}

.su-cell.initialCell  {
    background-color: #e6e6e6;
}

.su-cell.hasFocus {
    background-color: #e6c500;
}

.su-cell .mode1 {
    font-size: v-bind(calcFontsizeNormalMode());
    line-height: v-bind(size+'px');
    color: #2c64d5
}

.su-cell.initialCell .mode1 {
    color: black;
}
.su-cell .mode2 {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 0px;
    font-size: v-bind(calcFontsizeCandidateMode());
    line-height: v-bind(size/3+'px');
    color: #000
}

.candidate-cell {
    min-width: v-bind(size/3+'px');
    min-height: v-bind(size/3+'px');
    max-width: v-bind(size/3+'px');
    max-height: v-bind(size/3+'px');
    text-align: center;
    opacity: 0%;
}

.su-cell.hasFocus .candidate-cell:hover {
    opacity: 25%;
}

.candidate-cell.candidateSet {
    opacity: 50%;
}

.su-cell .conflictIndicator {
    position: absolute;
    right: 4px;
    bottom: 4px;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: #ff4b56;
}

</style>