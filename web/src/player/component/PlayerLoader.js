/*
 * Copyright 2017-2020 The ShadowEditor Authors. All rights reserved.
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file.
 * 
 * For more information, please visit: https://github.com/tengge1/ShadowEditor
 * You can also visit: https://gitee.com/tengge1/ShadowEditor
 */
import PlayerComponent from './PlayerComponent';
import Converter from '../../serialization/Converter';
import global from '../../global';

/**
 * 播放器下载事件
 * @param {*} app 播放器
 */
class PlayerLoader extends PlayerComponent {
    constructor(app) {
        super(app);
    }

    create(jsons, options) {
        return new Converter().fromJson(jsons, {
            // TODO: global.app.options.server is not a player config
            server: global.app.options.server,
            domWidth: options.domWidth,
            domHeight: options.domHeight
        }).then(obj => {
            this.scene = obj.scene;
            return new Promise(resolve => {
                resolve(obj);
            });
        });
    }

    dispose() {
        // TODO: 彻底清空下载的模型资源

        this.scene = null;
    }
}

export default PlayerLoader;