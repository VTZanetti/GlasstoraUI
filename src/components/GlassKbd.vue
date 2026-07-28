<template>
  <kbd class="gt-kbd"><slot /></kbd>
</template>

<style>
.gt-kbd {
  display: inline-block;
  padding: 0.1em 0.5em;
  font-family: var(--gt-font-mono);
  font-size: 0.85em;
  line-height: 1.6;
  color: var(--gt-fg);
  background: rgb(255 255 255 / 0.06);
  border: 1px solid rgb(255 255 255 / 0.25);
  border-bottom-width: 2px;
  border-radius: var(--gt-radius-sm);
  box-shadow: inset 0 -1px 0 rgb(255 255 255 / 0.12);
  vertical-align: baseline;
}
</style>
