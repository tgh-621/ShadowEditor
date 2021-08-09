/*
 * Copyright 2017-2020 The ShadowEditor Authors. All rights reserved.
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file.
 * 
 * For more information, please visit: https://github.com/tengge1/ShadowEditor
 * You can also visit: https://gitee.com/tengge1/ShadowEditor
 */
import BaseHelper from './BaseHelper';
import global from '../global';

/**
 * 相机帮助器
 * @author tengge / https://github.com/tengge1
 */
class CameraHelper extends BaseHelper {
    constructor() {
        super();
    }

    start() {
        global.app.on(`storageChanged.${this.id}`, this.onStorageChanged.bind(this));
        this.update();
    }

    stop() {
        global.app.on(`appStarted.${this.id}`, null);

        if (this.helper) {
            var scene = global.app.editor.sceneHelpers;
            scene.remove(this.helper);
            delete this.helper;
        }
    }

    update() {
        var showCamera = global.app.storage.showCamera;

        if (!this.helper) {
            this.helper = new THREE.CameraHelper(global.app.editor.camera);
        }

        var scene = global.app.editor.sceneHelpers;

        if (showCamera && this.helper.parent !== scene) {
            scene.add(this.helper);
        } else if (!showCamera && this.helper.parent === scene) {
            scene.remove(this.helper);
        }
    }

    onStorageChanged(key) {
        if (key === 'showCamera') {
            this.update();
        }
    }
}

export default CameraHelper;