<template>
    <div class="card flex justify-center">
        <Toast />
        <SplitButton label="Save" @click="save" :model="items" />
    </div>
</template>

<script setup>
import SplitButton from 'primevue/splitbutton';
import { useToast } from "primevue/usetoast";
const toast = useToast();

const items = [
    {
        label: 'Easy',
        command: () => {
            toast.add({ severity: 'success', summary: 'Easy', detail: 'New easy Sudoku generated.', life: 3000 });
        }
    },
    {
        label: 'Medium',
        command: () => {
            toast.add({ severity: 'success', summary: 'Medium', detail: 'New medium Sudoku generated.', life: 3000 });
        }
    },
    {
        label: 'Hard',
        command: () => {
            toast.add({ severity: 'success', summary: 'Hard', detail: 'New hard Sudoku generated.', life: 3000 });
        }
    },
    {
        label: 'Expert',
        command: () => {
            toast.add({ severity: 'success', summary: 'Expert', detail: 'New expert Sudoku generated.', life: 3000 });
        }
    },
    {
        separator: true
    },
    {
        label: 'Quit',
        command: () => {
            window.location.href = 'https://vuejs.org/';
        }
    }
];

const save = () => {
    toast.add({ severity: 'success', summary: 'Success', detail: 'Data Saved', life: 3000 });
};
</script>
