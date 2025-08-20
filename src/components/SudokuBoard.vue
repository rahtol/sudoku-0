<script lang="ts">

import type { TFocus } from '../CommonTypes';
import SudokuCell from './SudokuCell.vue';
type TSudokuCell = typeof SudokuCell;

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
        seedMode: {
            type: Boolean,
            required: false,
            default: false,
        },
    }, 
    data() {
        return {
            focus : { row: 0, col: 0},
        }
    },
    computed: {
        cell_width (): number
        {
            // 10 = board border 5px
            // 16 = spacing between cells 6*1px + 2*5px;
            return Math.floor((this.available_width - (10 + 16)) / 27) * 3;
        },
        board_width(): number
        {
            return this.cell_width * 9 + 16 + 10;
        },
        initialized(): boolean {
            return !this.seedMode && (this.$refs.cell as TSudokuCell[]).every((cell) => { return cell.solutionValue > 0; });
        },
        solved(): boolean {
            return !this.seedMode && (this.$refs.cell as TSudokuCell[]).every((cell) => { return cell.value == cell.solutionValue; });
        },
        solvable(): boolean {
            return !this.seedMode && (this.$refs.cell as TSudokuCell[]).every((cell) => { return cell.value == 0 || cell.value == cell.solutionValue; });
        },
    },
    methods: {
        px(i:number):string
        {
            return (i*this.cell_width + [0,1,2,7,8,9,14,15,16][i]) + 'px' ;
        },
        focusRequest(focus: TFocus) {
            this.focus = focus;
        },
        keyPressed(n: number) {
             (this.$refs.cell as TSudokuCell[])[this.focus.row*9 + this.focus.col].keyPressed(n);
        },
        stateChanged(cellChangeSpec: any) {
            console.log(cellChangeSpec);
            this.checkForConflictingValues();
            this.calculateAutoCandidates();
        },
        initializeBoard(initialValue: number[], solutionValue: number[]) {
            let i = 0;
            for (let cell of (this.$refs.cell as TSudokuCell[])) {
                cell.initializeCell(initialValue[i], solutionValue[i]);
                i += 1;
            }
            this.calculateAutoCandidates();
            this.checkForConflictingValues(); // just pro forma, should not be necessary - initial board expected to be consistent
        },
        enterSeedMode() {
            this.focus = {row: 0, col: 0};
        },
        cellSeeded(focus: TFocus) {
            this.focus = ((focus: TFocus): TFocus => {
                if (focus.col < 8) {
                    return {row: focus.row, col: focus.col +=1 }
                }
                else if (focus.row < 8) {
                    return {row: focus.row +=1, col: focus.col =0 }
                }
                else {
                    return { row: focus.row, col: focus.col }
                }
            }) (focus);
        },
        leaveSeedMode(): boolean {
            let na: number[] = (this.$refs.cell as TSudokuCell[]).map((c) => c.seedValue);
            console.log(na);
            const allCellsSeeded = na.every((n) => n >= 0);
            if (!allCellsSeeded) return false;
            const uniqueSolution = this.checkForUniqueSolution(na);
            console.log('checkForUniqueSolution', uniqueSolution != undefined);
            if (uniqueSolution != undefined) return false;
            if (uniqueSolution)
                this.initializeBoard(na, uniqueSolution);
            return true;
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
                    (this.$refs.cell as TSudokuCell[])[row * 9 + col].hasConflict = hasConflict;
                };
            };
        },
        checkForUniqueSolution(cell0: number[]) : number[] | undefined {
            let cell = Array(81).fill(0), solution: number[] = [];
            let isPossible = (idx: number, n:number) : boolean => {
                let col: number = idx % 9;
                let row: number = (idx - col) / 9;
                // check column
                for (let icol = 0; icol < 9; icol += 1)
                    if (cell[row * 9 + icol] == n) return false;
                // check row
                for (let irow = 0; irow < 9; irow += 1)
                    if (cell[irow * 9 + col] == n) return false;
                // check block
                let row0 : number = row - row % 3;
                let col0 : number = col - col % 3;
                for (let irow : number = row0; irow < row0 + 3; irow +=1)
                    for (let icol : number = col0; icol < col0 + 3; icol +=1)
                        if (cell[irow * 9 + icol] == n) return false;
                // finally, n is possible at cell idx since no exclusions were found
                return true; 
            };
            let isConsistent =(): boolean => {
                for (let i = 0; i < 81; i += 1) {
                    if (cell0[i] != 0) {
                        if (isPossible(i, cell0[i])) {
                            cell[i] = cell0[i];
                        }
                        else {
                            return false;
                        };
                    }
                };
                return true;
            };
            if (!isConsistent()) {
                return undefined;
            }
            let noSolutionsFound = 0;
            let helper = (idx: number) => {
                if (noSolutionsFound > 1) {
                    return;
                }
                while (idx < 81 && cell[idx] != 0) {
                    idx += 1;
                };
                if (idx == 81) {
                    solution = cell.slice();
                    noSolutionsFound +=1;
                    return;
                };
                // here we have: idx < 81 && cell[idx] == 0
                for (let n = 1; n <= 9; n +=1) {
                    if (isPossible(idx, n)) {
                        cell[idx] = n;
                        helper(idx + 1);
                        cell[idx] = 0;
                    };
                };
            };
            helper(0);
            return (noSolutionsFound == 1 ? solution : undefined);
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
                        :seedMode="seedMode"
                        @cellSeeded="cellSeeded"
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