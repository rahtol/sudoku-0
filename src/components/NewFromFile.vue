<script lang="ts">

import type { ref, PropType } from 'vue';
import Button from 'primevue/button';
import { isProxy, toRaw } from 'vue';

function calculate_canvas_size(image_width: number, image_height: number, window_width: number) : [number, number]
{
    const max_canvas_width = Math.min(window_width - 64, 800);
    const max_canvas_height = Math.min(window_width - 64, 700);
    const image_aspect_ratio = image_width / image_height;
    const canvas_aspect_ratio = max_canvas_width / max_canvas_height;

    let canvas_width: number;
    let canvas_height: number;

    if (image_aspect_ratio > canvas_aspect_ratio) {
        // Image is wider than the canvas
        canvas_width = max_canvas_width;
        canvas_height = max_canvas_width / image_aspect_ratio;
    } else {
        // Image is taller than the canvas
        canvas_height = max_canvas_height;
        canvas_width = max_canvas_height * image_aspect_ratio;
    }

    return [canvas_width, canvas_height];
}

async function doSudokuRecognition(blob : Blob) {
    const url = 'https://adkso5yy12kpdxo2.myfritz.net:3010'
    const request = {
        method: "POST",
        headers: {
        "Content-Type": "image/png",
        },
        body: blob,
    }
    try { 
        const response = await fetch(url, request)
        if (!response.ok) {
        throw new Error(`Responste status: ${response.status}`)
        }
        const result = await response.json();
        console.log(result);
        return result;
    }
    catch(error) {
        console.error((error as Error).message)
        return [];
    }
}

export default {
    name: 'NewFromFile',
    components: {
    },
    props: {
      filehandle: {
        required: true,
        type: Object as PropType<FileSystemFileHandle>,
      },
      windowWidth: {
        required: true,
        type: Number,
      },
    },
    emits: ['newFromFileActive'], 
    data() {
        return {
            dialog_state: 0,
            imageUrl: '',
            result : [] as number[][][],
        }
    },
    methods: {
        cancelButtonClicked() {
            console.log('cancelButtonClicked');
            this.$emit('newFromFileActive', false, this.filehandle, null);
        },
        okButtonClicked() {
            console.log('okButtonClicked');
            const res = toRaw(this.result)
            const res0 = res.length > 0 && res[0] ? res[0].flat() : [];
            console.log('Emitting newFromFileActive with result:', res0);
            this.$emit('newFromFileActive', false, this.filehandle, res0);
        },
        async startImageProcessing() {
            this.dialog_state = 0
            this.result = [];
            const file = await this.filehandle.getFile();
            this.imageUrl = URL.createObjectURL(file);
            const img = new Image();
            img.src = this.imageUrl;
            img.onload = () => {
                this.dialog_state = 1;
                console.log('Image loaded:', img.width, img.height);
                const canvas = this.$refs.canvas as HTMLCanvasElement;
                [canvas.width, canvas.height] = calculate_canvas_size(img.width, img.height, this.windowWidth);
                const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
                ctx.globalAlpha = 0.5;
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                (async () => {
                    this.result = await doSudokuRecognition(file);
                    this.dialog_state = 2;
                    ctx.globalAlpha = 1.0;
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
               })();
            }; 
        }
    },
    mounted() {
        this.startImageProcessing();
    },
}

</script>

<template>
    <div class="dialog-container">
        <canvas ref="canvas" style="border:1px solid #000000;"></canvas>
        <div class="p-8" style="display:flex; justify-content: center; gap: 1rem;">
            <Button label="Cancel" icon="pi pi-times" severity="contrast" @click="cancelButtonClicked" />
            <Button label ="Ok" icon="pi pi-check" severity="contrast" @click="okButtonClicked" :disabled="dialog_state!=2" :loading="dialog_state==1"></Button>
        </div>
    </div>
</template>

<style scoped>

.dialog-container {
  display: flex;
  flex-direction: column;
  margin-top: 20px;
  align-items: center;
}

</style>