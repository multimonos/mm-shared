import type p5 from 'p5';

export type P5 = p5 & {
    // Extend p5 with a destructor, so, we can cleanup our messes.
    destroy?(): void;
}

export type P5Constructor = typeof p5;


// FAILED ATTEMPTS //


/*
declare global {

    // Notes
    // --
    // To make this declaration available globally, I originally thought that tsconfig.json needed
    // to be modified, however, that didn't seem to be the case.
    //
    // Caveat, bc p5js is so fucking weird we would still need to `import type p5 from 'p5'` if
    // we wanted to use p5.Vector as a type.
    //
    // I tried many other approaches ... this is the one I can live with
    // --

    // Declaring the global P5 this way means we no longer need to `import type P5` anywhere.
    type P5 = p5 & {
        // Extend p5 with a destructor, so, we can cleanup our messes.
        destroy?(): void;
    }
}
*/


// import p5 from 'p5';
//
// // This injects 'destroy' directly into the official p5 class instance definition
// declare module 'p5' {
//     interface p5 {
//         destroy?(): void;
//     }
// }

// Export it as a clean alias if you still want to import { P5 } elsewhere
// export type P5 = p5;