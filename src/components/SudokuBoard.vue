<script lang="ts">

import SudokuCell from './SudokuCell.vue'

export default  {
    components: {
        SudokuCell,
    },
    props: {
        available_width : {
            type: Number,
            required : true,
        },
        mode : {
            type: Number,
            required : true,
        },
        autoCandidateMode : {
            type: Boolean,
            required : true,
        },
    }, 
    data() {
        return {
            focus : { row: 0, col: 0},
        }
    },
    computed: {
        cell_width ():number
        {
            // 10 = board border 5px
            // 16 = spacing between cells 6*1px + 2*5px;
            return Math.floor((this.available_width - (10 + 16)) / 27) * 3;
        },
        board_width():number
        {
            return this.cell_width * 9 + 16 + 10;
        },
    },
    methods: {
        px(i:number):string
        {
            return (i*this.cell_width + [0,1,2,7,8,9,14,15,16][i]) + 'px' ;
        },
        focusRequest(focus:any) {
            this.focus = focus;
        },
        keyPressed(n: number) {
             (this.$refs.cell as (typeof SudokuCell)[])[this.focus.row*9 + this.focus.col].keyPressed(n);
        },
        stateChanged(cellChangeSpec: any) {
            console.log(cellChangeSpec);
            this.checkForConflictingValues();
            this.calculateAutoCandidates();
        },
        initializeBoard(n: number[]) {
            let i = 0;
            for (let cell of (this.$refs.cell as (typeof SudokuCell)[])) {
                cell.initializeCell(n[i]);
                i += 1;
            }
            this.calculateAutoCandidates();
            this.checkForConflictingValues(); // just pro forma, should not be necessary - initial board expected to be consistent
        },
        calculateAutoCandidates() {
            let i: number = 0, cell : number[][] = [[],[],[],[],[],[],[],[],[]];
            for (let sucell of (this.$refs.cell as (typeof SudokuCell)[])) {
                cell[(i - i%9) / 9].push(sucell.value);
                i = i + 1; 
            }
            for (let row = 0; row < 9; row += 1) {
                for (let col = 0; col < 9; col += 1) {
                    if (cell[row][col] == 0) {
                        let excludedCandidates = 0; // at the beginning no value is excluded
                        // check row
                        for (let j : number = 0; j < 9; j +=1)
                            excludedCandidates |= (1 << cell[row][j]);
                        // check column
                        for (let i : number = 0; i < 9; i +=1)
                            excludedCandidates |= (1 << cell[i][col]);
                        // check block
                        let i0 : number = row - row % 3;
                        let j0 : number = col - col % 3;
                        for (let i : number = i0; i < i0 + 3; i +=1)
                            for (let j : number = j0; j < j0 + 3; j +=1)
                                excludedCandidates |= (1 << cell[i][j]);
                        // assign calculated bitset to actual SudokuCell
                        (this.$refs.cell as (typeof SudokuCell)[])[row * 9 + col].autoCandidatesCalculated = 1022 & ~excludedCandidates;
                    };
                };
            };
        },
        checkForConflictingValues() {
            let i: number = 0, cell : number[][] = [[],[],[],[],[],[],[],[],[]];
            for (let sucell of (this.$refs.cell as (typeof SudokuCell)[])) {
                cell[(i - i%9) / 9].push(sucell.value);
                i = i + 1; 
            }
            for (let row = 0; row < 9; row += 1) {
                for (let col = 0; col < 9; col += 1) {
                    // check one cell - but only if it has a value - a cell without value never is in conflict with another cell
                    let hasConflict : boolean = false;
                    if (cell[row][col] != 0) {
                        let referenceValue = cell [row][col]; // reference value
                        // check row, but skip the reference cell
                        for (let j : number = 0; j < 9; j +=1)
                            if (j != col) hasConflict = hasConflict || (referenceValue == cell[row][j]);
                        // check column, but skip the reference cell
                        for (let i : number = 0; i < 9; i +=1)
                            if (i != row) hasConflict = hasConflict || (referenceValue == cell[i][col]);
                        // check block, but skip the reference cell
                        let i0 : number = row - row % 3;
                        let j0 : number = col - col % 3;
                        for (let i : number = i0; i < i0 + 3; i +=1)
                            for (let j : number = j0; j < j0 + 3; j +=1)
                                if (i != row || j != col) hasConflict = hasConflict || (referenceValue == cell[i][j]);
                    };
                    // assign calculated result to actual SudokuCell
                    (this.$refs.cell as (typeof SudokuCell)[])[row * 9 + col].hasConflict = hasConflict;
                };
            };
        },
    },
}
</script>

<template>
    <div class="BordContainer">
       <template v-for="row in [0,1,2,3,4,5,6,7,8]" :key="row">
            <template v-for="col in [0,1,2,3,4,5,6,7,8]" :key="row*9+col">
                <SudokuCell
                        ref="cell"
                        :id="'Cell[' + row + ',' + col + ']'" 
                        :row="row" 
                        :col="col" 
                        :size="cell_width" 
                        :mode="mode"
                        :autoCandidateMode="autoCandidateMode"
                        :hasFocus="row == focus.row && col == focus.col"
                        :style="{ top: px(row), left: px(col) }"
                        @focusRequest="focusRequest"
                        @stateChanged="stateChanged"
                />
            </template> 
       </template> 
    </div>
</template>

<style scoped>
.BordContainer {
    position: relative;
    top: 0px;
    border: 5px solid black;
    background-color: #959595;
    min-width: v-bind(board_width+'px');
    min-height: v-bind(board_width+'px');
    margin: 0;
    
}

.su-cell {
    position: absolute;
    min-width: v-bind(cell_width+'px');
    min-height: v-bind(cell_width+'px');
    background-color: #fff;
}
</style>