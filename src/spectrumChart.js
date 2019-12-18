import Chart from 'chart.js'
import {convert} from './wavelengthToRGB.js'

const createSpectralGradient = (ctx, minX, maxX, minL, maxL) => {
  const colorFill = ctx.createLinearGradient(minX, 0, maxX, 0)
  const stepSize = 5
  for (let wl = minL; wl <= maxL; wl += stepSize) {
    const color = convert(wl)
    const proportion = (wl - minL) / (maxL - minL)
    colorFill.addColorStop(proportion, `rgb(${color[0]},${color[1]},${color[2]})`)
  }
  return colorFill
}

/* eslint-disable */

const origFunction = Chart.elements.Line.prototype.draw;

Chart.elements.Line.prototype.draw = function() {
  const points = this._children;
  const ctx = this._chart.ctx;
  const minX = points[0]._model.x;
  const maxX = points[points.length - 1]._model.x;
  const gradient = createSpectralGradient(ctx, minX, maxX, 380, 780)
  this._view.backgroundColor = gradient;
  for (const point of points) {
    point._view.backgroundColor = gradient;
  }
  origFunction.apply(this);
}

Chart.controllers.line = Chart.controllers.line.extend({
  datasetElementType: Chart.elements.Line,
});

/* eslint-enable */

export const createChart = (canvas, rows, sampleIdx) => {
  const ctx = canvas.getContext("2d");
  const labels = rows.map(([wavelength]) => wavelength)
  const data = rows.map(([, ...samples]) => samples[sampleIdx])

  return new Chart(ctx, {
    "data": {
      "datasets": [
      {
        data,
        "fill": true,
        "label": "S1",
        "pointRadius": 0
      }
      ],
      labels
    },
    "options": {
      "legend": {"display": false},
      "scales": {"xAxes": [
      {
        "ticks": {
            "maxTicksLimit": 21
        }
      }
      ]}
    },
    "type": 'line'
    })
}
