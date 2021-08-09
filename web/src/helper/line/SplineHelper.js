/*
 * Copyright 2017-2020 The ShadowEditor Authors. All rights reserved.
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file.
 * 
 * For more information, please visit: https://github.com/tengge1/ShadowEditor
 * You can also visit: https://gitee.com/tengge1/ShadowEditor
 */
import BaseHelper from '../BaseHelper';
import global from '../../global';

/**
 * 曲线帮助器基类
 * @author tengge / https://github.com/tengge1
 */
class SplineHelper extends BaseHelper {
    constructor() {
        super();
        this.box = [];
    }

    start() {
        global.app.on(`objectSelected.${this.id}`, this.onObjectSelected.bind(this));
        global.app.on(`objectChanged.${this.id}`, this.onObjectChanged.bind(this));
    }

    stop() {
        global.app.on(`objectSelected.${this.id}`, null);
        global.app.on(`objectChanged.${this.id}`, null);
    }

    onObjectSelected(object) {
        if (object === null) {
            this.onCancelSelectLine();
        } else if (object.userData && (
            object.userData.type === 'LineCurve' ||
            object.userData.type === 'CatmullRomCurve' ||
            object.userData.type === 'QuadraticBezierCurve' ||
            object.userData.type === 'CubicBezierCurve'
        )) {
            this.onSelectLine(object);
        }
    }

    onObjectChanged(obj) {
        if (this.box.length === 0) {
            return;
        }

        var scene = global.app.editor.sceneHelpers;
        var line = this.box[0].userData.object;

        if (obj === line) { // 修改了线
            line.userData.points.forEach((n, i) => {
                if (this.box[i]) {
                    this.box[i].position.copy(line.position).add(n);
                } else {
                    var mesh = new THREE.Mesh(this.box[0].geometry, this.box[0].material);

                    mesh.position.copy(line.position).add(n);

                    Object.assign(mesh.userData, {
                        type: 'helper',
                        object: line
                    });

                    scene.add(mesh);
                    this.box.push(mesh);
                }
            });

            if (this.box.length > line.userData.points.length) {
                this.box.splice(
                    line.userData.points.length,
                    this.box.length - line.userData.points.length
                ).forEach(n => {
                    delete n.object;
                    scene.remove(n);
                });
            }
        } else if (obj.userData && obj.userData.type === 'helper') { // 修改了帮助器
            var object = obj.userData.object;

            var index = this.box.indexOf(obj);

            if (index > -1) {
                object.userData.points[index].copy(object.position).multiplyScalar(-1).add(obj.position);
                object.update();
            }
        }
    }

    onSelectLine(object) {
        var scene = global.app.editor.sceneHelpers;

        this.onCancelSelectLine();

        var geometry = new THREE.BoxBufferGeometry(0.4, 0.4, 0.4);
        var material = new THREE.MeshBasicMaterial({
            color: 0xff0000
        });

        object.userData.points.forEach(n => {
            var mesh = new THREE.Mesh(geometry, material);

            mesh.position.copy(object.position).add(n);

            Object.assign(mesh.userData, {
                type: 'helper',
                object: object
            });

            scene.add(mesh);
            this.box.push(mesh);
        });
    }

    onCancelSelectLine() {
        var scene = global.app.editor.sceneHelpers;

        this.box.forEach(n => {
            scene.remove(n);
            delete n.userData.object;
        });

        this.box.length = 0;
    }
}

export default SplineHelper;