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
import global from '../global';

/**
 * 光线投射事件
 * @author tengge / https://github.com/tengge1
 */
class RaycastEvent extends BaseEvent {
    constructor() {
        super();
        this.mouse = new THREE.Vector2();
        this.raycaster = new THREE.Raycaster();
    }

    start() {
        global.app.on(`mousedown.${this.id}`, this.onMouseDown.bind(this));
        global.app.on(`mouseup.${this.id}`, this.onMouseUp.bind(this));
    }

    stop() {
        global.app.on(`mousedown.${this.id}`, null);
        global.app.on(`mouseup.${this.id}`, null);
    }

    onMouseDown(event) {
        if (event.target !== global.app.editor.renderer.domElement) {
            return;
        }

        this.isDown = true;
        this.x = event.offsetX;
        this.y = event.offsetY;
    }

    onMouseUp(event) {
        if (event.target !== global.app.editor.renderer.domElement) {
            return;
        }

        if (!this.isDown || this.x !== event.offsetX || this.y !== event.offsetY) {
            return;
        }

        let domElement = global.app.editor.renderer.domElement;

        this.mouse.x = event.offsetX / domElement.clientWidth * 2 - 1;
        this.mouse.y = -event.offsetY / domElement.clientHeight * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, global.app.editor.view === 'perspective' ? global.app.editor.camera : global.app.editor.orthCamera);

        let intersects = this.raycaster.intersectObjects(global.app.editor.scene.children, true);

        if (intersects.length > 0) {
            global.app.call('raycast', this, intersects[0], event);
            global.app.call('intersect', this, intersects[0], event, intersects);
        } else {
            // 没有碰撞到任何物体，则跟y=0的平面碰撞
            let plane = new THREE.Plane().setFromNormalAndCoplanarPoint(new THREE.Vector3(0, 1, 0), new THREE.Vector3());
            let target = new THREE.Vector3();
            this.raycaster.ray.intersectPlane(plane, target);

            global.app.call('raycast', this, {
                point: target,
                distance: this.raycaster.ray.distanceSqToPoint(target),
                object: null
            }, event);
        }
    };
}

export default RaycastEvent;