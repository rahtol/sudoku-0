<script lang="ts">

import type { ref, PropType } from 'vue';
import Button from 'primevue/button';
import { isProxy, toRaw } from 'vue';
import type { C } from 'node_modules/tailwindcss/dist/resolve-config-QUZ9b-Gn.d.mts';

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
            result : [] as { board: number[][], framing_path: number[][] }[],
            selected_board_index: 0,
            scale : 1.0,
        }
    },
    methods: {
        cancelButtonClicked() {
            console.log('cancelButtonClicked');
            this.$emit('newFromFileActive', false, this.filehandle, null);
        },
        chgSelButtonClicked() {
            console.log('chgSelButtonClicked');
            const new_index = (this.selected_board_index + 1) % this.result.length;
            this.set_selected_board_index(new_index);
        },
        okButtonClicked() {
            console.log('okButtonClicked');
            const res = toRaw(this.result)
            const res0 = res.length > 0 && res[this.selected_board_index] ? res[this.selected_board_index]!.board.flat() : [];
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
                this.scale = canvas.width / img.width;
                const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
                ctx.globalAlpha = 0.2;
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                (async () => {
                    this.result = await doSudokuRecognition(file);
                    this.dialog_state = 2;
                    const region = this.calculate_clip_region(canvas.width / img.width);
                    ctx.globalAlpha = 1.0;
                    ctx.save();
                    ctx.clip(region);
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    ctx.restore();
                    for (const res of this.result) {
                        this.draw_framing_path(ctx, res.framing_path, canvas.width / img.width, 'black');
                    }
                    this.selected_board_index = 0;
                    if (this.result.length > 0) {
                        this.set_selected_board_index(0);
                    }
               })();
            }; 
        },
        set_selected_board_index(index: number) {
            if (index < 0 || index >= this.result.length) {
                console.warn('Invalid board index:', index);
                return;
            }
            const canvas = this.$refs.canvas as HTMLCanvasElement;
            const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
            this.draw_framing_path(ctx, this.result[this.selected_board_index]!.framing_path, this.scale, 'black');
            this.selected_board_index = index;
            this.draw_framing_path(ctx, this.result[this.selected_board_index]!.framing_path, this.scale, 'red');
        },
        draw_framing_path(ctx: CanvasRenderingContext2D, framing_path: number[][], scale: number, color: string) {
            const path = this.convert_path_to_canvas_coordinates(framing_path, scale);
            ctx.strokeStyle = color;
            ctx.lineWidth = 3;
            ctx.stroke(path);
        },
        convert_path_to_canvas_coordinates(framing_path: number[][], scale: number) : Path2D {
            const path = new Path2D();
            const first_point = framing_path[0];
            if (!first_point || first_point.length < 2) {
                return path;
            }
            path.moveTo(first_point[0]! * scale, first_point[1]! * scale);
            for (let i = 1; i < framing_path.length; i++) {
                const point = framing_path[i];
                if (point!.length < 2) {
                    console.warn('Invalid point in framing_path:', point);
                    continue;
                }
                path.lineTo(point![0]! * scale, point![1]! * scale);
            }
            path.closePath();
            return path;
        },
        calculate_clip_region(scale : number) : Path2D {
            const path = new Path2D();
            const results = toRaw(this.result);
            for (const result of results) {
                path.addPath(this.convert_path_to_canvas_coordinates(result.framing_path, scale));
            } 
            return path;
        },
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
            <Button label ="Chg Sel" severity="contrast" @click="chgSelButtonClicked" :disabled="dialog_state!=2 || result.length < 2" :badge="result.length.toString()"></Button>
            <Button label ="Ok" icon="pi pi-check" severity="contrast" @click="okButtonClicked" :disabled="dialog_state!=2 || result.length == 0" :loading="dialog_state==1"></Button>
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