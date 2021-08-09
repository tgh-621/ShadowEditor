/*
 * Copyright 2017-2020 The ShadowEditor Authors. All rights reserved.
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file.
 * 
 * For more information, please visit: https://github.com/tengge1/ShadowEditor
 * You can also visit: https://gitee.com/tengge1/ShadowEditor
 */
import './css/SaveSceneWindow.css';
import {Button, Buttons, CheckBox, Content, Form, FormControl, Input, Label, Window} from '../../../ui/index';
import Converter from '../../../serialization/Converter';
import Ajax from '../../../utils/Ajax';
import global from '../../../global';

/**
 * 保存场景窗口
 * @author tengge / https://github.com/tengge1
 */
class SaveSceneWindow extends React.Component {
    constructor(props) {
        super(props);

        if (global.app.options.saveChild === undefined) {
            global.app.options.saveChild = true;
        }

        if (global.app.options.saveMaterial === undefined) {
            global.app.options.saveMaterial = true;
        }

        this.state = {
            sceneName: global.app.editor.sceneName || _t('New Scene'),
            saveChild: global.app.options.saveChild,
            saveMaterial: global.app.options.saveMaterial
        };

        this.handleChange = this.handleChange.bind(this);

        this.handleSave = this.handleSave.bind(this);
        this.handleClose = this.handleClose.bind(this);
    }

    render() {
        const {sceneName, saveChild, saveMaterial} = this.state;

        return <Window
            className={'SaveSceneWindow'}
            title={_t('Save Scene')}
            style={{width: '400px', height: '320px'}}
            mask={false}
            onClose={this.handleClose}
        >
            <Content>
                <Form>
                    <FormControl>
                        <Label>{_t('Name')}</Label>
                        <Input name={'sceneName'}
                               value={sceneName}
                               onChange={this.handleChange}
                        />
                    </FormControl>
                    <FormControl>
                        <Label>{_t('Save Child')}</Label>
                        <CheckBox name={'saveChild'}
                                  checked={saveChild}
                                  onChange={this.handleChange}
                        />
                    </FormControl>
                    <FormControl>
                        <Label>{_t('Save Material')}</Label>
                        <CheckBox name={'saveMaterial'}
                                  checked={saveMaterial}
                                  onChange={this.handleChange}
                        />
                    </FormControl>
                </Form>
            </Content>
            <Buttons>
                <Button onClick={this.handleSave}>{_t('OK')}</Button>
                <Button onClick={this.handleClose}>{_t('Cancel')}</Button>
            </Buttons>
        </Window>;
    }

    handleChange(value, name) {
        if (name === 'saveChild' || name === 'saveMaterial') {
            global.app.options[name] = value;
        }
        this.setState({
            [name]: value
        });
    }

    handleSave() {
        var editor = global.app.editor;

        const {sceneName} = this.state;

        global.app.mask(_t('Waiting...'));

        var obj = new Converter().toJSON({
            options: global.app.options,
            camera: editor.camera,
            renderer: editor.renderer,
            scripts: editor.scripts,
            animations: editor.animations,
            scene: editor.scene
        });

        Ajax.post(`${global.app.options.server}/api/Scene/Save`, {
            Name: sceneName,
            Data: JSON.stringify(obj)
        }, result => {
            var obj = JSON.parse(result);

            if (obj.Code === 200) {
                editor.sceneID = obj.ID;
                editor.sceneName = sceneName;
                document.title = sceneName;
            }

            global.app.call(`sceneSaved`, this);

            global.app.unmask();

            this.handleClose();

            global.app.toast(_t(obj.Msg), 'success');
        });
    }

    handleClose() {
        global.app.removeElement(this);
    }
}

export default SaveSceneWindow;