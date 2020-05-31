/**
 * @author alteredq / http://alteredqualia.com/
 */

import {
  DataTexture,
  FloatType,
  MathUtils,
  RGBFormat,
  ShaderMaterial,
  UniformsUtils,
} from "three";
import { Pass } from "three/examples/jsm/postprocessing/Pass.js";
import { DigitalGlitch } from "three/examples/jsm/shaders/DigitalGlitch.js";

export class GlitchPass extends Pass {
  public uniforms: any;
  public material: any;
  public fsQuad: any;
  public goWild: any;
  public curF: any;
  public randX: any;

  constructor(dt_size?: any) {
    super();

    if (DigitalGlitch === undefined)
      console.error("GlitchPass relies on DigitalGlitch");

    var shader = DigitalGlitch;
    this.uniforms = UniformsUtils.clone(shader.uniforms);

    if (dt_size == undefined) dt_size = 64;

    this.uniforms["tDisp"].value = this.generateHeightmap(dt_size);

    this.material = new ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: shader.vertexShader,
      fragmentShader: shader.fragmentShader,
    });

    this.fsQuad = new Pass.FullScreenQuad(this.material);

    this.goWild = false;
    this.curF = 0;
    this.generateTrigger();
  }

  render(
    renderer: any,
    writeBuffer: any,
    readBuffer: any /*, deltaTime, maskActive */
  ) {
    this.uniforms["tDiffuse"].value = readBuffer.texture;
    this.uniforms["seed"].value = Math.random(); //default seeding
    this.uniforms["byp"].value = 0;

    if (this.curF % this.randX == 0 || this.goWild == true) {
      this.uniforms["amount"].value = Math.random() / 30;
      this.uniforms["angle"].value = MathUtils.randFloat(-Math.PI, Math.PI);
      this.uniforms["seed_x"].value = MathUtils.randFloat(-1, 1);
      this.uniforms["seed_y"].value = MathUtils.randFloat(-1, 1);
      this.uniforms["distortion_x"].value = MathUtils.randFloat(0, 1);
      this.uniforms["distortion_y"].value = MathUtils.randFloat(0, 1);
      this.curF = 0;
      this.generateTrigger();
    } else if (this.curF % this.randX < this.randX / 5) {
      this.uniforms["amount"].value = Math.random() / 90;
      this.uniforms["angle"].value = MathUtils.randFloat(-Math.PI, Math.PI);
      this.uniforms["distortion_x"].value = MathUtils.randFloat(0, 1);
      this.uniforms["distortion_y"].value = MathUtils.randFloat(0, 1);
      this.uniforms["seed_x"].value = MathUtils.randFloat(-0.3, 0.3);
      this.uniforms["seed_y"].value = MathUtils.randFloat(-0.3, 0.3);
    } else if (this.goWild == false) {
      // this.uniforms["byp"].value = 1;
    }

    this.curF++;

    if (this.renderToScreen) {
      renderer.setRenderTarget(null);
      this.fsQuad.render(renderer);
    } else {
      renderer.setRenderTarget(writeBuffer);
      if (this.clear) renderer.clear();
      this.fsQuad.render(renderer);
    }
  }

  generateTrigger() {
    this.randX = MathUtils.randInt(120, 240);
  }

  generateHeightmap(dt_size: any) {
    var data_arr = new Float32Array(dt_size * dt_size * 3);
    var length = dt_size * dt_size;

    for (var i = 0; i < length; i++) {
      var val = MathUtils.randFloat(0, 1);
      data_arr[i * 3 + 0] = val;
      data_arr[i * 3 + 1] = val;
      data_arr[i * 3 + 2] = val;
    }

    return new DataTexture(data_arr, dt_size, dt_size, RGBFormat, FloatType);
  }
}
