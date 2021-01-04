import { get_pitch } from "./pitchdetect";
import $ from "jquery";

function party(colors: Colors, callback: CalculateCallback): void {
    // Get Stream
    navigator.mediaDevices
        .getUserMedia({
            // eslint-disable-next-line
            // @ts-ignore
            audio: { mandatory: { chromeMediaSource: "desktop" } },
            // eslint-disable-next-line
            // @ts-ignore
            video: { mandatory: { chromeMediaSource: "desktop" } },
        })
        .then((stream) => {
            const audioContext = new AudioContext();
            const audioStream = audioContext.createMediaStreamSource(stream);

            const analyserNode = new AnalyserNode(audioContext, {
                fftSize: 1024,
            });

            audioStream.connect(analyserNode);
            // analyserNode.connect(audioContext.destination)

            calculate(audioContext, analyserNode, colors, callback);
        })
        .catch(console.error);
}

type CalculateCallback = (color: Colors | number[]) => void;
function calculate(
    audioContext: AudioContext,
    analyser: AnalyserNode,
    colors: Colors,
    callback: CalculateCallback
): void {
    requestAnimationFrame(() => calculate(audioContext, analyser, colors, callback));

    const volume = get_volume(analyser, 50, 3);
    let pitch = get_pitch(audioContext, analyser);

    const pitch_max = 5000;
    const pitch_min = 200;
    pitch = pitch > pitch_max ? pitch_max : pitch;
    pitch = pitch < pitch_min ? pitch_min : pitch;

    pitch = ((pitch - pitch_min) * 100) / (pitch_max - pitch_min);

    const color = get_color(colors, pitch).map(x => x * volume / 100);

    callback(color);
}

type Color = [number, number, number];
type Colors = Color[];
function get_color(colors: Colors, pos: number): Color {
    if (!colors.length) return [0, 0, 0];
    else if (colors.length == 1) return colors[0];

    // Limit range to 0-100.
    let limit_pos = pos < 0 ? 0 : pos;
    limit_pos = limit_pos > 100 ? 100 : limit_pos;

    // Get color positions
    const positions: number[] = [];
    colors.forEach((val, i) => {
        positions.push((i / (colors.length - 1)) * 100);
    });

    // If the position only overlaps 1 of the colors
    if (positions.includes(limit_pos)) {
        return colors[positions.indexOf(limit_pos)];
    } else {
        let color_low: Color = [0, 0, 0];
        let color_high: Color = [0, 0, 0];

        let pos_low = 0;
        let pos_high = 0;

        for (let i = 0; i < positions.length; i++) {
            const position = positions[i];
            if (position > limit_pos) {
                pos_low = positions[i - 1];
                pos_high = positions[i];

                color_low = colors[i - 1];
                color_high = colors[i];

                break;
            }
        }

        let diff =
            ((limit_pos - pos_low - (100 - pos_high)) / (pos_high - pos_low)) *
            100;

        if (diff < 0) diff += 100;

        const final_color: Color = [0, 0, 0];
        for (let j = 0; j < 3; j++) {
            final_color[j] =
                (color_high[j] * diff) / 100 +
                (color_low[j] * (100 - diff)) / 100;
        }

        return final_color;
    }
}

function get_volume(
    analyser: AnalyserNode,
    volume_ceil: number,
    multiplier?: number
): number {
    const volume_data_arr = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(volume_data_arr);

    let res =
        volume_data_arr.reduce((a, b) => a + b, 0) / volume_data_arr.length;
    res *= multiplier || 1;
    res = res > volume_ceil ? volume_ceil : res;
    res *= 100 / 50;
    return Math.round(res);
}

export { party };
