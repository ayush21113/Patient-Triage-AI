import { el, on } from "../util/dom.js";

const renderedSheet = new WeakMap();
const vitalFields = [
 ["hr", "HR", false],
 ["sbp", "SBP", false],
 ["dbp", "DBP", false],
 ["rr", "RR", false],
 ["spo2", "SpO₂", false],
 ["tempC", "Temp", true]
];
const visualChecks = [
 ["pale", "Pale"],
 ["diaphoretic", "Diaphoretic"],
 ["drowsy", "Drowsy"],
 ["distressed", "Distressed"],
 ["cyanosed", "Cyanosed"],
 ["active_major_bleeding", "Active bleeding"],
 ["cannot_speak_full_sentences", "Cannot speak full sentences"],
 ["airway_compromise", "Airway compromise"],
 ["seizure_active", "Seizure now"],
 ["heavy_vaginal_bleeding", "Heavy vaginal bleeding"]
];
const engineFieldNames = {
 tempC: "temp_c"
};

function labelledField(label, control) {
 const wrapper = el("label", { class: "capture-field" });
 const labelNode = el("span", { class: "capture-label" });
 labelNode.textContent = label;
 wrapper.append(labelNode, control);
 return wrapper;
}

function numericInput(field, label, decimal, value = null) {
 const input = el("input", {
  id: `capture-${field}`,
  class: "numeric-input numeric",
  type: "text",
  inputmode: "none",
  readonly: "",
  "data-numeric-field": field,
  "data-decimal": String(decimal),
  "aria-label": label
 });
 input.value = value ?? "";
 return input;
}

function toggleButton(value, label, pressed = false) {
 const button = el("button", {
  type: "button",
  "data-value": value,
  "aria-pressed": String(pressed)
 });
 button.textContent = label;
 return button;
}

function toggleGroup(label, values, className = "chip-group") {
 const fieldset = el("fieldset", { class: "capture-fieldset" });
 const legend = el("legend", { class: "capture-label" });
 legend.textContent = label;
 const group = el("div", { class: className });
 for (const [value, text, pressed] of values) {
  group.append(toggleButton(value, text, pressed));
 }
 fieldset.append(legend, group);
 return fieldset;
}

function bindSingleSelect(fieldset, onChange = () => {}) {
 on(fieldset, "click", event => {
  const button = event.target.closest("button[data-value]");
  if (!button) return;
  for (const peer of fieldset.querySelectorAll("button[data-value]")) {
   peer.setAttribute("aria-pressed", String(peer === button));
  }
  onChange(button.dataset.value);
 });
}

function bindMultiSelect(fieldset) {
 on(fieldset, "click", event => {
  const button = event.target.closest("button[data-value]");
  if (!button) return;
  button.setAttribute(
   "aria-pressed",
   String(button.getAttribute("aria-pressed") !== "true")
  );
 });
}

function selectedValue(fieldset) {
 return fieldset.querySelector('button[aria-pressed="true"]')?.dataset.value ??
  null;
}

function selectedValues(fieldset) {
 return [...fieldset.querySelectorAll('button[aria-pressed="true"]')]
  .map(button => button.dataset.value);
}

function qualifierValues(condition, values = new Set()) {
 if (condition.all) {
  for (const child of condition.all) qualifierValues(child, values);
 } else if (condition.any) {
  for (const child of condition.any) qualifierValues(child, values);
 } else if (condition.field === "complaint_qualifiers") {
  values.add(condition.value);
 }
 return values;
}

function qualifiersFor(protocol, className) {
 const definition = protocol.presentation.classes[className];
 const values = new Set();
 for (const modifier of definition.modifiers) {
  qualifierValues(modifier.when, values);
 }
 return values;
}

function numericKeypad(form) {
 const keypad = el("fieldset", { class: "capture-fieldset keypad-fieldset" });
 const legend = el("legend", { class: "capture-label" });
 legend.textContent = "Numeric keypad";
 const keys = el("div", { class: "numeric-keypad" });
 let activeInput = null;
 on(form, "click", event => {
  const input = event.target.closest("input[data-numeric-field]");
  if (input) {
   activeInput = input;
   for (const peer of form.querySelectorAll("input[data-numeric-field]")) {
    peer.classList.toggle("input-active", peer === input);
   }
  }
 });
 for (const key of ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "CLEAR"]) {
  const button = el("button", { type: "button", "data-key": key });
  button.textContent = key;
  on(button, "click", () => {
   if (!activeInput) return;
   if (key === "CLEAR") {
    activeInput.value = "";
   } else if (key !== "." ||
     (activeInput.dataset.decimal === "true" &&
      !activeInput.value.includes("."))) {
    activeInput.value += key;
   }
  });
  keys.append(button);
 }
 keypad.append(legend, keys);
 return keypad;
}

function vitalControls(latest = null) {
 const fieldset = el("fieldset", { class: "capture-fieldset vitals-fieldset" });
 const legend = el("legend", { class: "capture-label" });
 legend.textContent = "Vitals";
 const grid = el("div", { class: "vitals-entry-grid" });
 for (const [field, label, decimal] of vitalFields) {
  const engineField = engineFieldNames[field] ?? field;
  const input = numericInput(field, label, decimal, latest?.[engineField]);
  const unavailable = latest?.unobtainable.includes(engineField) ?? false;
  const toggle = toggleButton(
   field,
   `${unavailable ? "●" : "○"} Unobtainable`,
   unavailable
  );
  toggle.classList.add("unobtainable-toggle");
  on(toggle, "click", () => {
   const pressed = toggle.getAttribute("aria-pressed") !== "true";
   toggle.setAttribute("aria-pressed", String(pressed));
   toggle.textContent = `${pressed ? "●" : "○"} Unobtainable`;
   if (pressed) input.value = "";
  });
  const row = el("div", { class: "vital-entry" });
  row.append(labelledField(label, input), toggle);
  grid.append(row);
 }
 fieldset.append(legend, grid);
 return fieldset;
}

function visualControls(latest = {}, showObstetric = false) {
  const fieldset = toggleGroup(
    "Visual checks",
    visualChecks.map(([value, label]) => [value, label, latest[value] ?? false]),
    "visual-grid"
  );
  const obstetric = fieldset.querySelector('[data-value="heavy_vaginal_bleeding"]');
  if (obstetric) obstetric.hidden = !showObstetric;
  bindMultiSelect(fieldset);

  const customRow = el("div", { class: "custom-note-row" });
  const customInput = el("input", {
    type: "text",
    class: "custom-note-input",
    placeholder: "Type custom check/note (e.g. Nausea)..."
  });
  const addBtn = el("button", { type: "button", class: "add-note-btn" });
  addBtn.textContent = "+ Add Note";

  on(addBtn, "click", () => {
    const text = customInput.value.trim();
    if (!text) return;
    const value = `custom_${text.toLowerCase().replace(/\s+/g, "_")}`;
    const grid = fieldset.querySelector(".visual-grid");
    const chip = toggleButton(value, text, true);
    grid.append(chip);
    customInput.value = "";
  });

  on(customInput, "keydown", event => {
    if (event.key === "Enter") {
      event.preventDefault();
      addBtn.click();
    }
  });

  customRow.append(customInput, addBtn);
  fieldset.append(customRow);
  return fieldset;
}

function observationFrom(form, acvpu, visual) {
 const vitals = {};
 const unobtainable = [];
 for (const [field] of vitalFields) {
  const input = form.querySelector(`[data-numeric-field="${field}"]`);
  const unavailable = form.querySelector(
   `.unobtainable-toggle[data-value="${field}"]`
  ).getAttribute("aria-pressed") === "true";
  vitals[field] = input.value === "" ? null : Number(input.value);
  if (unavailable) unobtainable.push(field);
 }
 return {
  acvpu: selectedValue(acvpu),
  painScore: null,
  vitals,
  visual: Object.fromEntries(selectedValues(visual).map(value => [value, true])),
  unobtainable
 };
}

function arrivalSheet(sheet, protocol, handlers) {
 const form = el("form", { class: "capture-form arrival-form" });
 const complaint = el("input", {
  id: "capture-complaint",
  type: "text",
  autocomplete: "off"
 });
 const complaintClass = toggleGroup(
  "Complaint class",
  Object.keys(protocol.presentation.classes).map(value => [
   value,
   value.replaceAll("_", " "),
   value === "unknown"
  ]),
  "chip-group complaint-classes"
 );
 const qualifiers = toggleGroup(
  "Complaint qualifiers",
  [
   "thunderclap",
   "neck_stiffness",
   "neurovascular_compromise",
   "radiating",
   "exertional",
   "sudden_onset",
   "reported_change_from_baseline"
  ].map(value => [value, value.replaceAll("_", " "), false])
 );
 qualifiers.hidden = true;
 bindMultiSelect(qualifiers);
 function showQualifiers(className) {
  const visible = qualifiersFor(protocol, className);
  for (const button of qualifiers.querySelectorAll("button[data-value]")) {
   button.hidden = !visible.has(button.dataset.value);
   if (button.hidden) button.setAttribute("aria-pressed", "false");
  }
  qualifiers.hidden = visible.size === 0;
 }
 bindSingleSelect(complaintClass, showQualifiers);

 const age = numericInput("age", "Age", false);
 const ageUnit = toggleGroup("Age unit", [
  ["days", "d", false],
  ["months", "mo", false],
  ["years", "y", true]
 ]);
 bindSingleSelect(ageUnit);
 const estimated = toggleButton("estimated", "○ Estimated", false);
 on(estimated, "click", () => {
  const pressed = estimated.getAttribute("aria-pressed") !== "true";
  estimated.setAttribute("aria-pressed", String(pressed));
  estimated.textContent = `${pressed ? "●" : "○"} Estimated`;
 });
 const sex = toggleGroup("Sex", [
  ["M", "M", false],
  ["F", "F", false],
  ["X", "X", false],
  ["unknown", "—", true]
 ]);
 bindSingleSelect(sex);
 const pregnancy = toggleGroup("Pregnancy", [
  ["not_pregnant", "No", false],
  ["pregnant", "Pregnant", false],
  ["postpartum", "Postpartum", false],
  ["unknown", "—", true]
 ]);

 const vitals = vitalControls();
 const acvpu = toggleGroup("ACVPU · required", [
  ["A", "A", false],
  ["C", "C", false],
  ["V", "V", false],
  ["P", "P", false],
  ["U", "U", false]
 ], "chip-group acvpu-group");
 const visual = visualControls();
 bindSingleSelect(pregnancy, value => {
  const heavyBleeding = visual.querySelector(
   '[data-value="heavy_vaginal_bleeding"]'
  );
  heavyBleeding.hidden = !["pregnant", "postpartum"].includes(value);
  if (heavyBleeding.hidden) {
   heavyBleeding.setAttribute("aria-pressed", "false");
  }
 });
 const submit = el("button", {
  class: "primary-action",
  type: "submit",
  disabled: ""
 });
 submit.textContent = "Admit to queue";
 bindSingleSelect(acvpu, () => submit.removeAttribute("disabled"));

 const demographics = el("div", { class: "demographics-grid" });
 const ageField = el("div", { class: "age-entry" });
 ageField.append(labelledField("Age", age), ageUnit, estimated);
 demographics.append(ageField, sex, pregnancy);
 const left = el("div", { class: "capture-column" });
 left.append(
  labelledField("Chief complaint", complaint),
  complaintClass,
  qualifiers,
  demographics
 );
 const centre = el("div", { class: "capture-column" });
 centre.append(vitals);
 const right = el("div", { class: "capture-column" });
 right.append(acvpu, visual, numericKeypad(form));
 const actions = el("div", { class: "sheet-actions" });
 actions.append(submit);
 form.append(left, centre, right, actions);

 on(form, "submit", event => {
  event.preventDefault();
  const ageValue = age.value === "" ? null : Number(age.value);
  handlers.onAdmit({
   arrivalMode: "unknown",
   ageValue,
   ageUnit: ageValue === null ? null : selectedValue(ageUnit),
   ageEstimated: ageValue === null ||
    estimated.getAttribute("aria-pressed") === "true",
   sex: selectedValue(sex),
   pregnancyStatus: selectedValue(pregnancy),
   gestationWeeks: null,
   language: null,
   complaintText: complaint.value || null,
   complaintClass: selectedValue(complaintClass),
   complaintQualifiers: selectedValues(qualifiers),
   preexistingFlags: [],
   frame: observationFrom(form, acvpu, visual)
  });
 });
 sheet.append(form);
 complaint.focus();
}

function reassessmentSheet(sheet, board, encounterId, handlers) {
 const source = board.find(({ encounter }) =>
  encounter.encounter_id === encounterId
 );
 const latest = source.encounter.observations.at(-1);
 const form = el("form", { class: "capture-form reassess-form" });
 const vitals = vitalControls(latest);
 const acvpu = toggleGroup("ACVPU · required", ["A", "C", "V", "P", "U"]
  .map(value => [value, value, value === latest.acvpu]),
 "chip-group acvpu-group");
 bindSingleSelect(acvpu);
 const visual = visualControls(
  latest.visual,
  ["pregnant", "postpartum"].includes(source.encounter.pregnancy_status)
 );
 const submit = el("button", { type: "submit" });
 submit.textContent = "Commit reassessment";
 const left = el("div", { class: "capture-column" });
 left.append(vitals);
 const right = el("div", { class: "capture-column" });
 right.append(acvpu, visual, numericKeypad(form));
 const actions = el("div", { class: "sheet-actions" });
 actions.append(submit);
 form.append(left, right, actions);
 on(form, "submit", event => {
  event.preventDefault();
  handlers.onReassess(
   encounterId,
   observationFrom(form, acvpu, visual)
  );
 });
 sheet.append(form);
}

export function renderCaptureSheet(
 backdrop,
 sheet,
 sheetState,
 board,
 protocol,
 handlers
) {
 if (!sheetState) {
  backdrop.hidden = true;
  renderedSheet.delete(backdrop);
  return;
 }
 const key = `${sheetState.type}:${sheetState.encounterId ?? "new"}`;
 if (renderedSheet.get(backdrop) === key) return;
 renderedSheet.set(backdrop, key);
 backdrop.hidden = false;
 sheet.replaceChildren();
 const header = el("div", { class: "sheet-header" });
 const title = el("h2", { id: "capture-sheet-heading" });
 title.textContent = sheetState.type === "arrival"
  ? "Arrival capture"
  : `Reassessment · ${sheetState.encounterId}`;
 const close = el("button", { type: "button" });
 close.textContent = "Close";
 on(close, "click", handlers.onClose);
 header.append(title, close);
 sheet.append(header);
 if (sheetState.type === "arrival") {
  arrivalSheet(sheet, protocol, handlers);
 } else {
  reassessmentSheet(
   sheet,
   board,
   sheetState.encounterId,
   handlers
  );
 }
 sheet.querySelector("input, button[aria-pressed]")?.focus();
}
