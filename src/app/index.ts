import "../../scss/base.scss";
import { party } from "./party";
import $ from "jquery";

party([
    [255, 0, 0],
    [0, 0, 255],
], (color) => {
    $("body").css(
        "background-color",
        `rgb(${color.join(",")})`
    );
});
