const Board = JXG.JSXGraph.initBoard('box', { boundingbox: [-50, 25, 50, -25], axis: true });
let currentRectangles, currentFunction;
let mathFunction;


const Form = document.querySelector("form");
const RectanglesInput = document.querySelector("#num-of-rectangles");
const ErrorOrResult = document.querySelector("#result-or-error");
const ErrorWrapper = document.querySelector("#error-wrapper");
const Output = document.querySelector("#result-wrapper");

function getLimits() {
  return [
    parseFloat(Form.querySelector("#lower-limit").value),
    parseFloat(Form.querySelector("#upper-limit").value)
  ];
}

function getRectangles() {
  return parseInt(RectanglesInput.value);
}

function validateLimits(inf, sup) {
  if (inf >= sup) throw new Error("El límite inferior debe ser menor que el límite superior");
}

function validateNumOfRectangles(n) {
  if (isNaN(n) || n <= 0) throw new Error("El número de rectángulos debe ser mayor que 0");
}

function logError(message) {
  ErrorOrResult.className = "error";
  ErrorWrapper.textContent = message;
}

function submitHandler() {
  const customFunction = Form.querySelector("input#custom-function").value;
  const [inf, sup] = getLimits();
  const numOfRectangles = getRectangles();
  let compiledFunction;

  try {
    /* Validar entradas */
    validateLimits(inf, sup);
    validateNumOfRectangles(numOfRectangles);
  } catch (error) {
    logError(error.message);
    return;
  }

  try {
    /* Validar función */
    compiledFunction = math.compile(customFunction);
    let temp = compiledFunction.evaluate({ x: 0 });
    if (typeof temp === "undefined") throw new Error();
  } catch (error) {
    logError("La función ingresada no es válida");
    return;
  }
  ErrorOrResult.className = "result";

  /* Limpia el tablero */
  if (currentRectangles != undefined) Board.removeObject(currentRectangles);
  if (currentFunction != undefined) Board.removeObject(currentFunction);

  mathFunction = x => compiledFunction.evaluate({ x: x });

  /* Graficar rectángulos */
  currentRectangles = Board.create(
    "riemannsum",
    [mathFunction, numOfRectangles, "right", inf, sup],
    {
      fillColor: "red", fillOpacity: 0.3, strokeColor: "transparent"
    }
  );
  /* Graficar función */
  currentFunction = Board.create(
    "functiongraph",
    [mathFunction, inf, sup]
  );

  /* Actualizar resultado de integral */
  Output.textContent = riemannSum([inf, sup], numOfRectangles, mathFunction);
}

Form.addEventListener("submit", e => {
  e.preventDefault();
  submitHandler();
})


function riemannSum([inf, sup], numOfRectangles, mathFunction) {
  // ∆x
  const diffX = (sup - inf) / numOfRectangles;

  // Sumatoria
  let summation = 0;

  for (let i = 1; i <= numOfRectangles; i++) {
    // suma += f(a + i * ∆x) * ∆x;
    summation += mathFunction(inf + i * diffX) * diffX;
  }
  return summation;
}

function updateRectangles() {
  if (mathFunction == undefined) {
    console.error("No se ha creado una función matemática")
    return;
  }
  if (currentRectangles != undefined) Board.removeObject(currentRectangles);

  const [inf, sup] = getLimits();
  let numOfRectangles = getRectangles();

  try {
    validateLimits(inf, sup);
    validateNumOfRectangles(numOfRectangles);
  } catch (error) {
    console.error(error.message)
  }

  currentRectangles = Board.create(
    "riemannsum",
    [mathFunction, numOfRectangles, "left", inf, sup],
    {
      fillColor: "red", fillOpacity: 0.3, strokeColor: "transparent"
    }
  );

  Output.textContent = riemannSum([inf, sup], numOfRectangles, mathFunction);
}

RectanglesInput.addEventListener("change", submitHandler);


