import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatTime, createQueue, currentTrack, advance, selectTrack, progress
} from '../assets/js/player-core.js';

const brani = [
  { title: 'Valentango', src: 'a.mp3', duration: 228 },
  { title: 'Casse Gueule', src: 'b.mp3', duration: 174 },
  { title: 'Donna Lee', src: 'c.mp3', duration: 138 }
];

test('formatTime scrive minuti e secondi con due cifre', () => {
  assert.equal(formatTime(228), '3:48');
  assert.equal(formatTime(7), '0:07');
  assert.equal(formatTime(0), '0:00');
  assert.equal(formatTime(3600), '60:00');
});

test('formatTime regge valori non validi', () => {
  assert.equal(formatTime(NaN), '0:00');
  assert.equal(formatTime(-5), '0:00');
  assert.equal(formatTime(Infinity), '0:00');
});

test('createQueue parte dal primo brano', () => {
  const coda = createQueue(brani);
  assert.equal(coda.index, 0);
  assert.equal(currentTrack(coda).title, 'Valentango');
});

test('createQueue regge una coda vuota', () => {
  const coda = createQueue([]);
  assert.equal(coda.index, -1);
  assert.equal(currentTrack(coda), null);
});

test('advance scorre in avanti e torna al principio', () => {
  let coda = createQueue(brani);
  coda = advance(coda, 1);
  assert.equal(currentTrack(coda).title, 'Casse Gueule');
  coda = advance(coda, 1);
  coda = advance(coda, 1);
  assert.equal(currentTrack(coda).title, 'Valentango');
});

test('advance scorre allindietro partendo dal primo', () => {
  const coda = advance(createQueue(brani), -1);
  assert.equal(currentTrack(coda).title, 'Donna Lee');
});

test('advance non modifica la coda ricevuta', () => {
  const coda = createQueue(brani);
  advance(coda, 1);
  assert.equal(coda.index, 0);
});

test('selectTrack sceglie per indice e ignora quelli fuori intervallo', () => {
  const coda = createQueue(brani);
  assert.equal(currentTrack(selectTrack(coda, 2)).title, 'Donna Lee');
  assert.equal(selectTrack(coda, 9).index, 0);
  assert.equal(selectTrack(coda, -1).index, 0);
});

test('progress restituisce una frazione fra zero e uno', () => {
  assert.equal(progress(114, 228), 0.5);
  assert.equal(progress(0, 228), 0);
  assert.equal(progress(300, 228), 1);
  assert.equal(progress(10, 0), 0);
});

test('due dischi danno due code indipendenti', () => {
  const primo = createQueue(brani);
  const secondo = createQueue([{ title: 'Brughiere', src: 'd.mp3', duration: 0 }]);
  assert.equal(currentTrack(selectTrack(primo, 2)).title, 'Donna Lee');
  assert.equal(currentTrack(secondo).title, 'Brughiere');
  assert.equal(primo.tracks.length, 3);
});
