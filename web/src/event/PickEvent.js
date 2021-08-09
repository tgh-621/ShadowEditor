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
import MeshUtils from '../utils/MeshUtils';
import global from '../global';

/**
 * 选取事件
 * @author tengge / https://github.com/tengge1
 */
class PickEvent extends BaseEvent {
    constructor() {
        super();
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();

        this.onDownPosition = new THREE.Vector2();
        this.onUpPosition = new THREE.Vector2();

        this.onAppStarted = this.onAppStarted.bind(this);
        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
    }

    start() {
        global.app.on(`appStarted.${this.id}`, this.onAppStarted);
    }

    onAppStarted() {
        global.app.viewport.addEventListener('mousedown', this.onMouseDown, false);
    }

    onMouseDown(event) {
        if (event.button !== 0) { // 只允许左键选中
            return;
        }

        // 1、这样处理选中的原因是避免把拖动误认为点击
        // 2、不能使用preventDefault，因为div无法获得焦点，无法响应keydown事件。
        // event.preventDefault();

        let array = this.getMousePosition(global.app.viewport, event.clientX, event.clientY);
        this.onDownPosition.fromArray(array);

        document.addEventListener('mouseup', this.onMouseUp, false);
    }

    onMouseUp(event) {
        let array = this.getMousePosition(global.app.viewport, event.clientX, event.clientY);
        this.onUpPosition.fromArray(array);

        this.handleClick();

        document.removeEventListener('mouseup', this.onMouseUp, false);
    }

    getIntersects(point, objects) {
        this.mouse.set(point.x * 2 - 1, -(point.y * 2) + 1);
        this.raycaster.setFromCamera(this.mouse, global.app.editor.view === 'perspective' ? global.app.editor.camera : global.app.editor.orthCamera);
        return this.raycaster.intersectObjects(objects);
    }

    getMousePosition = function (dom, x, y) {
        let rect = dom.getBoundingClientRect();
        return [(x - rect.left) / rect.width, (y - rect.top) / rect.height];
    }

    handleClick() {
        let editor = global.app.editor;
        let objects = editor.objects;

        const selectMode = global.app.storage.selectMode;

        if (this.onDownPosition.distanceTo(this.onUpPosition) === 0) {
            let intersects = this.getIntersects(this.onUpPosition, objects);

            if (intersects.length > 0) {
                let object = intersects[0].object;

                if (object.userData.object !== undefined) {
                    // helper
                    // TODO: userData上有object时，无法复制模型。
                    editor.select(object.userData.object);
                } else if (selectMode === 'whole') { // 选择整体
                    editor.select(MeshUtils.partToMesh(object));
                } else if (selectMode === 'part') { // 选择部分
                    editor.select(object);
                }
            } else {
                editor.select(null);
            }

            // objects in sceneHelpers
            let sceneHelpers = global.app.editor.sceneHelpers;

            intersects = this.getIntersects(this.onUpPosition, sceneHelpers.children);
            if (intersects.length > 0) {
                if (!(intersects[0].object instanceof THREE.GridHelper)) { // 禁止选中网格
                    editor.select(intersects[0].object);
                }
            }
        }
    }
}

export default PickEvent;