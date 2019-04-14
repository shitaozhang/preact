import { setupRerender } from 'preact/test-utils';
import { createElement as h, render } from 'preact';
import { setupScratch, teardown } from '../../../test/_util/helpers';
import { useMemo, useState } from '../../src';

/** @jsx h */


describe('useMemo', () => {

	/** @type {HTMLDivElement} */
	let scratch, rerender;

	beforeEach(() => {
		scratch = setupScratch();
		rerender = setupRerender();
	});

	afterEach(() => {
		teardown(scratch);
	});

	it('only recomputes the result when inputs change', () => {
		let memoFunction = sinon.spy((a, b) => a + b);
		const results = [];

		function Comp({ a, b }) {
			const result = useMemo(() => memoFunction(a, b), [a, b]);
			results.push(result);
			return null;
		}

		render(<Comp a={1} b={1} />, scratch);
		render(<Comp a={1} b={1} />, scratch);

		expect(results).to.deep.equal([2, 2]);
		expect(memoFunction).to.have.been.calledOnce;

		render(<Comp a={1} b={2} />, scratch);
		render(<Comp a={1} b={2} />, scratch);

		expect(results).to.deep.equal([2, 2, 3, 3]);
		expect(memoFunction).to.have.been.calledTwice;
	});

	it.skip('short circuits diffing for memoized components', () => {
		let spy = sinon.spy();
		let spy2 = sinon.spy();
		const X = ({ count }) => {
			spy();
			return <p>{count}</p>;
		};

		const Y = ({ count }) => {
			spy2();
			return <p>{count}</p>;
		};

		const App = ({ x }) => {
			const y = useMemo(() => <Y count={x} />, [x]);
			return (
				<div>
					<X count={x} />
					{y}
				</div>
			);
		};

		render(<App x={0} />, scratch);
		expect(spy).to.be.calledOnce;
		expect(spy2).to.be.calledOnce;
		render(<App x={0} />, scratch);
		expect(spy).to.be.calledTwice;
		expect(spy2).to.be.calledOnce;
		render(<App x={1} />, scratch);
		expect(spy2).to.be.calledTwice;
		expect(spy).to.be.calledThrice;
	});

});
