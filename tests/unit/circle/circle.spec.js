import { expect } from "chai";
import { mount } from "@vue/test-utils";
import Vue from "vue";
import Circle from "../../../src/components/Circle/Circle.vue";
import HalfCircle from "../../../src/components/Circle/HalfCircle.vue";
import VueEllipseProgress from "../../../src/components/VueEllipseProgress.vue";
import { dotParser } from "../../../src/components/optionsParser";

const factory = (propsData, container = Circle) => {
  return mount(container, {
    propsData: {
      index: 0,
      id: 123,
      multiple: false,
      ...propsData,
    },
  });
};

const randomNumberInRange = (min = 0, max = 10) => Math.floor(Math.random() * (max - min + 1)) + min;

describe("[ CircleProgress.vue | HalfCircleProgress.vue ]", () => {
  describe("#progress", () => {
    it("calculates the progress circle stroke offset correctly", () => {
      const progress = 60;
      const size = 200;
      const thickness = 4;

      const wrapper = factory({
        size,
        progress,
        thickness,
        emptyThickness: thickness,
        animation: "default 0 0",
      });

      const radius = size / 2 - thickness / 2;
      const circumference = radius * 2 * Math.PI;
      const expectedOffset = circumference - (progress / 100) * circumference;

      expect(wrapper.vm.progressOffset).to.equal(expectedOffset);
    });
  });
  describe("#size", () => {
    it("calculates and sets the position of the circles correctly", () => {
      const progress = 60;
      const size = 200;
      const position = 200 / 2;

      const wrapper = factory({
        progress,
        size,
      });

      const circleProgressWrapper = wrapper.find("circle.ep-circle--progress");
      const circleEmptyWrapper = wrapper.find("circle.ep-circle--empty");

      expect(wrapper.vm.position).to.equal(position);

      expect(circleProgressWrapper.element.getAttribute("cx")).to.equal(`${position}`);
      expect(circleProgressWrapper.element.getAttribute("cy")).to.equal(`${position}`);

      expect(circleEmptyWrapper.element.getAttribute("cx")).to.equal(`${position}`);
      expect(circleEmptyWrapper.element.getAttribute("cy")).to.equal(`${position}`);
    });
    it("calculates the circumference of the progress circles correctly", () => {
      const progress = 60;
      const size = 200;
      const thickness = 4;
      const radius = size / 2 - thickness / 2;
      const circumference = radius * 2 * Math.PI;

      const wrapper = factory({
        size,
        progress,
        thickness,
        emptyThickness: thickness,
      });

      expect(wrapper.vm.circumference).to.equal(circumference);
    });
  });
  describe("#half", () => {
    const progress = 50;
    const size = 200;
    const thickness = 10;

    const wrapper = factory(
      {
        progress,
        thickness,
        size,
        half: true,
        animation: "default 0 0",
      },
      HalfCircle
    );

    const radius = size / 2 - thickness / 2;
    const position = size / 2 - radius;
    const expectedPath = ` M ${position}, ${size / 2} a ${radius},${radius} 0 1,1 ${radius * 2},0`;

    const circleProgressWrapper = wrapper.find(".ep-half-circle--progress.ep-circle--progress");
    const circleEmptyWrapper = wrapper.find(".ep-half-circle--empty");

    it("renders half progress circle SVG path", () => {
      expect(wrapper.contains("path.ep-half-circle--progress.ep-circle--progress")).to.be.true;
    });
    it("renders half empty circle SVG path", () => {
      expect(wrapper.contains("path.ep-half-circle--empty")).to.be.true;
    });

    it("calculates and sets the position of the half circles correctly", () => {
      expect(wrapper.vm.position).to.equal(position);
      expect(wrapper.vm.path).to.equal(expectedPath);

      expect(circleProgressWrapper.element.getAttribute("d")).to.equal(`${expectedPath}`);
      expect(circleEmptyWrapper.element.getAttribute("d")).to.equal(`${expectedPath}`);
    });
    it("calculates the progress circle stroke offset correctly", async () => {
      const circumference = (radius * 2 * Math.PI) / 2;
      const expectedOffset = circumference - (progress / 100) * circumference;
      expect(wrapper.vm.progressOffset).to.equal(expectedOffset);
      expect(circleProgressWrapper.element.style.strokeDashoffset).to.equal(`${expectedOffset}`);
    });
  });
  describe("#dash", () => {
    it("applies the #dash value as string correctly", () => {
      const dash = "10 10";
      const wrapper = factory({
        progress: 50,
        dash,
      });

      const circleEmptyWrapper = wrapper.find("circle.ep-circle--empty");
      expect(circleEmptyWrapper.element.getAttribute("stroke-dasharray")).to.equal(`${dash}`);
    });

    it("applies the #dash value with #dash.spacing and #dash.count in strict mode correctly", () => {
      const dash = "strict 60 0.5";
      const wrapper = factory({
        progress: 50,
        dash,
      });

      expect(wrapper.vm.parsedDash.count).to.equal(60);
      expect(wrapper.vm.parsedDash.spacing).to.equal(0.5);
    });
  });
  describe("#noData", () => {
    const progress = 60;
    const size = 200;
    const thickness = 10;

    const wrapper = factory({ noData: true, progress, size });
    const circleProgressWrapper = wrapper.find("circle.ep-circle--progress");
    const circleEmptyWrapper = wrapper.find("circle.ep-circle--empty");

    it("sets the stroke dash offset to circumference value", () => {
      const radius = size / 2 - thickness / 2;
      const circumference = radius * 2 * Math.PI;

      expect(circleProgressWrapper.element.style.strokeDashoffset).to.equal(`${circumference}`);
    });
    it("adds .ep-circle--nodata class to empty circle", () => {
      expect(circleEmptyWrapper.classes()).to.include("ep-circle--nodata");
    });
    it("resets the progress circle animation class", () => {
      expect(circleProgressWrapper.classes()).to.not.include("animation__default");
    });
  });
  describe("#loading", () => {
    const progress = 60;
    const size = 200;
    const thickness = 10;

    const wrapper = factory({ loading: true, progress, size });

    const circleProgressWrapper = wrapper.find("circle.ep-circle--progress");

    it("sets the stroke dash offset to circumference value", () => {
      const radius = size / 2 - thickness / 2;
      const circumference = radius * 2 * Math.PI;

      expect(circleProgressWrapper.element.style.strokeDashoffset).to.equal(`${circumference}`);
    });
    it("adds .animation__loading class to progress circle", () => {
      expect(circleProgressWrapper.classes()).to.include("animation__loading");
    });
  });
  describe("#determinate", () => {
    const progress = 60;
    const color = "gray";
    const thickness = 15;
    const wrapper = factory({
      progress,
      color,
      thickness,
      determinate: true,
    });

    it("shows the determinate loading circle", () => {
      expect(wrapper.contains(".ep-circle--determinate")).to.be.true;
    });
    it("applies same styles to determinate circle as to progress circle", () => {
      const determinateCircleWrapper = wrapper.find(".ep-circle--determinate");
      expect(determinateCircleWrapper.element.getAttribute("stroke")).to.equal(`${color}`);
      expect(determinateCircleWrapper.element.getAttribute("stroke-width")).to.equal(`${thickness}`);
      expect(determinateCircleWrapper.element.getAttribute("fill")).to.equal("transparent");
    });
  });
  describe("#angle", () => {
    const circleWrapper = factory({ progress: 50 });
    it("sets the rotation of the svg container to default, if not defined", () => {
      expect(circleWrapper.element.style.transform).to.equal("rotate(-90deg)");
    });
    it("sets the rotation of the svg container correctly", async () => {
      const angle = 80;
      circleWrapper.setProps({ angle });
      await Vue.nextTick();
      expect(circleWrapper.element.style.transform).to.equal(`rotate(${angle}deg)`);
    });
    it("sets @0 value as the rotation of the svg container correctly", async () => {
      const angle = 0;
      circleWrapper.setProps({ angle });
      await Vue.nextTick();
      expect(circleWrapper.element.style.transform).to.equal(`rotate(${angle}deg)`);
    });
  });
  describe("#data", () => {
    const size = 600;
    const globalThickness = 5;
    const globalGap = 5;
    const globalDot = "2%";

    const data = [];
    // generate random test data
    for (let n = 0; n < 6; n++) {
      data.push({
        progress: 25,
        gap: randomNumberInRange(),
        thickness: randomNumberInRange(),
      });
    }
    // some special cases
    data.push({ progress: 50, thickness: 5 });
    data.push({ progress: 50, thickness: "2%", dot: 0 });
    data.push({ progress: 50, thickness: "4%", gap: 3 });
    data.push({ progress: 50, thickness: "4%", gap: 3, dot: 5 });
    data.push({ progress: 50, thickness: "0%", gap: 3, dot: "5% red" });
    data.push({ progress: 50, thickness: 6, gap: 5, dot: "5 red" });
    data.push({ progress: 50, gap: 5 });
    data.push({ progress: 50, gap: 0 });
    data.push({ progress: 50 });

    const wrapper = factory(
      { data, gap: globalGap, thickness: globalThickness, size, dot: globalDot },
      VueEllipseProgress
    );
    const circleWrappers = wrapper.findAll(Circle);

    const calculateThickness = (t) => (t.toString().includes("%") ? (parseFloat(t) * size) / 100 : t);

    for (let i = 0; i < data.length; i++) {
      const circleData = data[i];
      it(`calculates the radius of circle #${i} correctly
        #thickness ${circleData.thickness} | #gap ${circleData.gap} | #dot ${circleData.dot} `, () => {
        const circleGap = circleData.gap !== undefined ? circleData.gap : globalGap;
        const circleThickness = calculateThickness(
          circleData.thickness !== undefined ? circleData.thickness : globalThickness
        );
        const circleDot = calculateThickness(dotParser(circleData.dot !== undefined ? circleData.dot : globalDot).size);

        let radius;
        const baseRadius = size / 2 - Math.max(circleThickness, circleDot) / 2;
        if (i > 0) {
          const previousCirclesData = data.filter((props, index) => index < i);
          const previousCirclesThickness = previousCirclesData
            .map(({ gap, thickness, dot }, n) => {
              const g = gap !== undefined ? gap : globalGap;
              const t = calculateThickness(thickness !== undefined ? thickness : globalThickness);
              const d = calculateThickness(dotParser(dot !== undefined ? dot : globalDot).size);
              const thicknessWithDot = Math.max(t, d);
              return n > 0 ? g + thicknessWithDot : thicknessWithDot;
            })
            .reduce((acc, current) => acc + current);

          radius = baseRadius - (previousCirclesThickness + circleGap);
        } else {
          radius = baseRadius;
        }
        const circleProgressWrapper = circleWrappers.at(i).find("circle.ep-circle--progress");
        const circleEmptyWrapper = circleWrappers.at(i).find("circle.ep-circle--empty");
        expect(circleProgressWrapper.element.getAttribute("r")).to.equal(`${radius}`);
        expect(circleEmptyWrapper.element.getAttribute("r")).to.equal(`${radius}`);
      });
    }
  });
});
