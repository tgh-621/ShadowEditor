/*
 * Copyright 2017-2020 The ShadowEditor Authors. All rights reserved.
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file.
 * 
 * For more information, please visit: https://github.com/tengge1/ShadowEditor
 * You can also visit: https://gitee.com/tengge1/ShadowEditor
 */
import BaseEvent from './BaseEvent';
import Rain from '../object/weather/Rain';
import Snow from '../object/weather/Snow';
import global from '../global';

/**
 * 视图事件
 * @author tengge / https://github.com/tengge1
 */
class WeatherEvent extends BaseEvent {
    constructor() {
        super();
        this.weather = '';
        this.object = null;

        this.onOptionChange = this.onOptionChange.bind(this);
        this.onAfterRender = this.onAfterRender.bind(this);
    }

    start() {
        global.app.on(`optionChange.${this.id}`, this.onOptionChange);
        global.app.on(`afterRender.${this.id}`, this.onAfterRender);
    }

    stop() {
        global.app.on(`optionChange.${this.id}`, null);
    }

    onOptionChange(name, value) {
        if (name !== 'weather') {
            return;
        }
        this.weather = value;

        if (this.object) {
            global.app.editor.sceneHelpers.remove(this.object);
            this.object = null;
        }

        if (this.weather === 'rain') {
            if (this.rain === undefined) {
                this.rain = new Rain();
            }
            this.object = this.rain;
            global.app.editor.sceneHelpers.add(this.rain);
        }

        if (this.weather === 'snow') {
            if (this.snow === undefined) {
                this.snow = new Snow();
            }
            this.object = this.snow;
            global.app.editor.sceneHelpers.add(this.snow);
        }
    }

    onAfterRender() {
        if (this.object) {
            this.object.update();
        }
    }
}

export default WeatherEvent;