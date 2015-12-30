import {describe, it} from 'mocha';
import {expect} from 'chai';

import React, {Component} from 'react';
import Vex from 'vexflow';

import {
    renderIntoDocument,
    scryManyWithTag,
    findOneWithTag,
    declareMochaMock,
} from '../TestUtils';

import ChordEngraving from '../../src/components/ChordEngraving';

describe('ChordEngraving', () => {

    declareMochaMock(Vex.Flow, 'Renderer', class {
        constructor(container) {
            this.container = container;
        }
        getContext() {
            return {
                provenance: "mocked Vex.Flow.Renderer#getContext()",
                renderer: this,
            };
        }
        static get Backends() {
            return { CANVAS: null };
        }
    });
    declareMochaMock(Vex.Flow, 'Stave', class {
        addClef() {
            return this;
        }
        setContext() {
            return this;
        }
        draw() {
        }
    });
    declareMochaMock(Vex.Flow.Formatter, 'FormatAndDraw', ctx => {
        const svg = document.createElement('svg');
        svg.getBBox = () => ({
            x: 10,
            y: 20,
            width: 100,
            height: 200,
        });
        ctx.renderer.container.appendChild(svg);
    });

    const getSVGChildren = component =>
        scryManyWithTag(component, 'div')
            .filter(div => div.getElementsByTagName('svg').length > 0);

    it("renders a note", () => {
        const component = renderIntoDocument(<ChordEngraving
            notes={[0, 4, 7]}
        />);
        expect(getSVGChildren(component)).to.have.length.at.least(1);
    });

    it("renders a message when a chord is way off the piano", () => {
        const component = renderIntoDocument(<ChordEngraving
            notes={[0, 4, 888]}
        />);
        expect(getSVGChildren(component)).to.have.length(0);
        expect(findOneWithTag(component, 'div'))
            .to.have.a.property('textContent')
            .that.contains('piano');
    });

    describe("when updating to new props", () => {
        class NoteHolder extends Component {
            constructor() {
                super();
                this.state = {
                    notes: [0, 4, 7],
                };
            }
            render() {
                return <ChordEngraving notes={this.state.notes} />;
            }
        }
        it("replaces an existing note", () => {
            const component = renderIntoDocument(<NoteHolder />);
            expect(getSVGChildren(component)).to.have.length(1);
            component.setState({ notes: [1, 5, 8] });
            expect(getSVGChildren(component)).to.have.length(1);
        });
        it("removes a note when it goes out of bounds", () => {
            const component = renderIntoDocument(<NoteHolder />);
            expect(getSVGChildren(component)).to.have.length(1);
            component.setState({ notes: [1, 5, 888] });
            expect(getSVGChildren(component)).to.have.length(0);
        });
    });

});
