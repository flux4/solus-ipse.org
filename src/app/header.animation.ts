import { trigger, state, style, animate, transition, sequence } from '@angular/animations';

export const HeaderAnimation =
trigger('routerTransition', [
  state('void', style({opacity: '0', width: '0' })),
  transition('void => *', [
      animate('150ms ease-out', style({ opacity: '1', width: '*', left:"0%" }))
  ]),
  transition('* => void', [
      style({ opacity: '1', width: '*'}),
      animate('150ms ease-out', style({ opacity: '0', width: '0' }))
  ])
]);