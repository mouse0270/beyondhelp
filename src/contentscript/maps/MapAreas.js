import "qtip2";

import { FragmentData, FragmentService } from "../../services/FragmentService";
import React, { Component } from 'react';

import $ from "jquery";
import C from "../../Constants";
import Configuration from "../../data/Configuration";
import Coordinates from "../../data/Coordinates";
import DrawingService from "./extrarefsmode/drawing/DrawingService";
import HtmlEncode from 'js-htmlencode';
import MapAreaInfo from "./MapAreaInfo";
import Opt from "../../Options";

class MapAreas extends Component {
    postProcessArea = (el: HTMLElement, href: string, area: MapAreaInfo) => {
        if (!el) return;

        // to force onclick attribute that stops click propagation that opens the light box
        el.setAttribute("onclick", "event.preventDefault(); event.stopPropagation();");

        // if is a comment setup the qtip
        if (area.areaType === C.MapAreaComment && area.comment) {


            const opts = {
                content: {
                    text: HtmlEncode.htmlEncode(area.comment),
                    title: area.title || ""
                },
                position: { target: 'mouse', adjust: { x: 5, y: 5 } },
                style: { classes: "BH-map-ref-comment-tooltip qtip-light" }
            };
            $(el).qtip(opts);
            if (DrawingService.isAnyCommandOn()) $(el).qtip("disable");
        }
    }

    toMapRef = ({ button }: MouseEvent, href: string) => {
        if (button !== 0) return;
        if (window.location.href === href) {
            window.dispatchEvent(new Event("hashchange"));
        } else {
            window.location = href;
        }
    }

    renderAreas = () => {
        const areas: MapAreaInfo[] = this.props.areas;
        const config: Configuration = this.props.config;
        if (!areas) return null;
        return areas.map(area => {
            const isComment = area.areaType === C.MapAreaComment;
            if (area.areaType === C.MapAreaRect && !config[Opt.MapRefsRect]) return;
            if (area.areaType === C.MapAreaCircle && !config[Opt.MapRefsCirc]) return;
            if (area.areaType === C.MapAreaRhombus && !config[Opt.MapRefsRho]) return;
            if (isComment && !config[Opt.MapRefsComments]) return;

            const shape = Coordinates.areaTypeToShape(area.areaType);

            // if area is missing info the tooltip class is not added
            // and a tooltip is nod added and href is set to void
            const tooltipable = area.isTooltiplable();
            const tooltipClass = tooltipable ? `BH-map-ref-${area.areaType}` : "";
            const className = isComment ? "BH-map-ref-comment" : `tooltip-hover BH-map-ref ${tooltipClass}`;
            const href = tooltipable && !isComment ? `${C.CompendiumPage}${area.page}${FragmentService.format(area.headerId, area.contentId, area.untilContentId, area.contentOnly)}` : "javascript:void(0)";

            const paperData = {};

            const safeColor = (color: string) => color.startsWith("#") ? color : "#" + color;
            if (area.color) paperData.color = safeColor(area.color);
            if (area.highlightColor) paperData.highlightColor = safeColor(area.highlightColor);

            return (
                <area
                    key={area.id || area.coords}
                    bh-id={area.id}
                    className={className}
                    href={href}
                    shape={shape}
                    type={area.areaType}
                    drawable={area.isDrawable.toString()}
                    coords={area.coords}
                    bh-paper-data={JSON.stringify(paperData)}
                    ref={(el) => this.postProcessArea(el, href, area)}
                    onMouseDown={(e) => this.toMapRef(e, href)}
                />
            );
        });
    }

    render() {
        return (
            <map name={this.props.mapImageName}>
                {this.renderAreas()}
            </map>
        );
    }
}

export default MapAreas;