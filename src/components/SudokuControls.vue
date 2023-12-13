<script lang="ts">

enum NormalCandidateMode {
    NormalMode = 1,
    CandidateMode = 2,
}

export default {
    props: [],
    data () {
        return {
            keyboardMode: NormalCandidateMode.NormalMode,
            autoCandidateMode : false,
        };
    },
    created () {
        this.keyboardMode = NormalCandidateMode.NormalMode;
    },
    methods: {
        isNormalMode() : boolean {
            return this.keyboardMode == NormalCandidateMode.NormalMode;
        },
        isCandidateMode() : boolean {
            return this.keyboardMode == NormalCandidateMode.CandidateMode;
        },
        setNormalMode() {
            if (this.keyboardMode != NormalCandidateMode.NormalMode) {
                this.keyboardMode = NormalCandidateMode.NormalMode;
                this.$emit('modeChange', this.keyboardMode);
            }
        },
        setCandidateMode() {
            if (this.keyboardMode != NormalCandidateMode.CandidateMode) {
                this.keyboardMode = NormalCandidateMode.CandidateMode;
                this.$emit('modeChange', this.keyboardMode);
            }
        },
        toggleAutoCandidateMode() {
            this.autoCandidateMode = !this.autoCandidateMode;
            this.notifyAutoCandidateModeChanged();
        },
        keyPressed(n: number) {
            this.$emit('keyPressed', { key: n, mode: this.keyboardMode });
        },
        notifyAutoCandidateModeChanged() {
            this.$emit('autoCandidateModeChange', this.autoCandidateMode);
        },
    }
}

</script>

<template>
  <div class="PanelContainer">
    <div class="NormalCandidate">
        <button tabindex="-1" class="NormalButton" :class="{ activated: isNormalMode() , deactivated: isCandidateMode() }" @click="setNormalMode()">Normal</button>
        <button tabindex="-1" class="CandidateButton" :class="{ activated: isCandidateMode() , deactivated: isNormalMode() }" @click="setCandidateMode()">Candidate</button>
    </div>
    <div class="NumberPad">
        <button tabindex="-1" class="NumberKey" @click="keyPressed(1)" @mousedown.prevent>1</button>
        <button tabindex="-1" class="NumberKey" @click="keyPressed(2)" @mousedown.prevent>2</button>
        <button tabindex="-1" class="NumberKey" @click="keyPressed(3)" @mousedown.prevent>3</button>
        <button tabindex="-1" class="NumberKey" @click="keyPressed(4)" @mousedown.prevent>4</button>
        <button tabindex="-1" class="NumberKey" @click="keyPressed(5)" @mousedown.prevent>5</button>
        <button tabindex="-1" class="NumberKey" @click="keyPressed(6)" @mousedown.prevent>6</button>
        <button tabindex="-1" class="NumberKey" @click="keyPressed(7)" @mousedown.prevent>7</button>
        <button tabindex="-1" class="NumberKey" @click="keyPressed(8)" @mousedown.prevent>8</button>
        <button tabindex="-1" class="NumberKey" @click="keyPressed(9)" @mousedown.prevent>9</button>
        <button tabindex="-1" class="DeleteButton" @click="keyPressed(0)">x</button>
    </div>
    <div class="AutoCandidateMode">
        <input tabindex="-1" type="checkbox" name="AutoCandidateMode" v-model="autoCandidateMode" @change="notifyAutoCandidateModeChanged" @mousedown.prevent/>
        <span> Auto Candidate Mode</span>
    </div>
  </div>  
</template>

<style scoped>

.PanelContainer {
    display: flex;
    flex-direction: column;
    align-items: center;
}
.NumberPad {
    margin-top: 14px;
    display: grid;
}

.NormalCandidate button {
    text-align: center;
    cursor: pointer;
    padding: 1px 6px;
    font-size: 14px;
}

.NormalButton {
    border-top-left-radius: 3px;
    border-bottom-left-radius: 3px;
    border: 1px solid;
    border-right: none;
}

.CandidateButton {
    border-top-right-radius: 3px;
    border-bottom-right-radius: 3px;
    border: 1px solid;
    border-left: none;
}

.NormalCandidate button.activated {
    background-color: #000;
    color: #fff;
    border-color: #000;
}

.NormalCandidate button.deactivated {
    background-color: #fff;
    color: #ccc;
    border-color: #ccc;
}

.NumberPad button {
    border: 1px solid #959595;
    border-radius: 3px;
    cursor: pointer;
    background-color: #e6e6e6;
    font-weight: bold;
}

.NumberPad button:active {
    opacity: 0.3;
}

.AutoCandidateMode {
    margin-top: 10px;
}
.AutoCandidateMode > input {
    width: 13px;
    height: 13px;
    margin: 0;
    margin-right: 5px;
}

.AutoCandidateMode > span {
    cursor: pointer;
}

@media (width > 820px) {

.PanelContainer {
    width: 240px;
    margin-left: 40px;
    align-items: stretch;
}
.NumberPad {
    grid-template-columns: 1fr 1fr 1fr;
    gap: 15px;
}

.NumberPad button {
    font-size: 32px;
}

.NormalCandidate button {
    width: 50%;
    height: 38px;
}

.NumberKey {
   width: 70px;
   height: 70px;
}

.DeleteButton {
   grid-column: 1 / 4;
   width: 100%;
   height: 48px;
}

}

@media (width <= 820px) {

.PanelContainer {
    width: 450px;
    margin-top: 40px;
}
.NumberPad {
    grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
    gap: 12px;
}

.NumberPad button {
    font-size: 20px;
}

.NormalCandidate button {
    width: 150px;
    height: 34px;
}

.NumberKey {
   width: 80px;
   height: 40px;
}

.DeleteButton {
   width: 80px;
   height: 40px;
}

}


</style>

