import {
  trigger, state, style, animate, transition,
} from '@angular/animations';

export const notifyAnimation = trigger('notify', [
  state('void', style({
    opacity: 0,
    height: 0,
    transform: 'scale(0.7)',
  })),
  state('show', style({
    opacity: 1,
    height: '*',
    transform: 'scale(1)',
  })),
  transition('void => show, show => void', [
    animate('.4s cubic-bezier(.25,.8,.25,1)')
  ]),
]);
