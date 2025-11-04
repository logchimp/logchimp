import Vue from "vue";

Vue.filter("trim", (value, size, trail = "...") => {
  if (!value) return "";
  const valueLength = value.length;

  value = value.slice(0, size);
  return value.trim() + (valueLength > size ? trail : "");
});
