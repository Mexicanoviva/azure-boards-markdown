/// <reference path="../declarations.d.ts" />

import * as React from "react";
import * as ReactDOM from "react-dom";

import * as Frame from "react-frame-component";

import { sharedStyles } from "../services/markdown";
import { ActionsCreator } from "../actions/actionsCreators";
import { SizeMode } from "../model/model";

const inlineStyles = require("raw!../assets/vsts-richtext.style");

export interface IPreviewProps {
    actionsCreator: ActionsCreator;

    htmlContent: string;
    sizeMode: SizeMode;
}

export class PreviewComponent extends React.Component<IPreviewProps, void> {
    private _resolveContent = (element: HTMLElement) => this._contentElement = element;
    private _contentElement: HTMLElement;

    public render(): JSX.Element {
        return <div className="preview">
            <Frame head={<style type="text/css">{inlineStyles + sharedStyles}</style>} contentDidMount={this._contentDidMount} contentDidUpdate={this._contentDidMount}>
                <div className="rendered-markdown" dangerouslySetInnerHTML={{ __html: this.props.htmlContent }} ref={this._resolveContent} />
            </Frame>
        </div>;
    }

    public shouldComponentUpdate(nextProps: IPreviewProps): boolean {
        return this.props.htmlContent !== nextProps.htmlContent || this.props.sizeMode !== nextProps.sizeMode;
    }

    private _contentDidMount = () => {
        if (this._contentElement) {
            let finishedCount = 0;

            let $images = $(this._contentElement).find("img");
            let delayedImages = $images.toArray().filter((img: HTMLImageElement) => !img.complete);
            let delayedCount = delayedImages.length;

            if (delayedCount > 0) {
                delayedImages.forEach((img) => {
                    $(img).on("load", () => {
                        $(img).off("load");
                        if (++finishedCount === delayedCount) {
                            this._sizeChange();
                        }
                    });
                });
            } else {
                this._sizeChange();
            }
        }
    }

    private _sizeChange() {
        if (this.props.sizeMode === SizeMode.AutoGrow) {
            const height = this._contentElement.scrollHeight;

            this.props.actionsCreator.resize(height);
        }
    }
}