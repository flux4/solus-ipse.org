import { trigger, state, style, animate, transition } from '@angular/animations';

export const FadeAnimation =
trigger('routerTransition', [
  transition(':enter', [
      style({ opacity: 0 }), // style at the start
      animate('150ms ease-in', style({ opacity: 1 })) // animation and style at the end
  ]),
  transition(':leave', [
      style({ opacity: 1, zIndex: 10 }), // style at the start
      animate('150ms ease-in', style({ opacity: 0 })) // animation and style at the end
  ])
]);