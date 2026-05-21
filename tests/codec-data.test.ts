import { describe, expect, it } from 'vitest'
import { createCodecReader, createCodecWriter, Format, snorm, snorm16, snorm8, squant, squant16, squant8 } from "../src";

const floats = new Float32Array( [
    1.0,
    0.0,
    0.38,
    -1.0,
    -0.71,
    -0.92,
] )

const ints = [ 1, 2, 3, 4, 5, 6 ]
const u8 = new Uint8Array( ints )
const u16 = new Uint16Array( ints )
const u8writer = createCodecWriter( Format.audio_time_u8 )
const reader = createCodecReader()

describe( `Data Maniuplations`, () => {

    describe( `Audio Data`, () => {

        it( `can map float -> u8 ( precision=1 )`, () => {
            floats.forEach( x =>
                expect( snorm8( squant8( x ) ) ).toBeCloseTo( x, 1 )
            )
        } )

        it( `can map floats -> u16 ( precision=4 )`, () => {
            floats.forEach( x =>
                expect( snorm16( squant16( x ) ) ).toBeCloseTo( x, 4 )
            )
        } )

        it( `can pack -> unpack floats for u8`, () => {
            u8writer.initBuffer( floats.length )

            floats.forEach( ( x, i ) => {
                u8writer.buf[i] = squant( x, u8writer.max )
            } )

            const packed = u8writer.pack()

            const unpacked = reader.unpack( packed )

            for ( let i = 0; i < reader.count; i++ ) {
                const x = snorm( reader.nth( i ), reader.max )
                expect( x ).toBeCloseTo( floats[i], 1 )
            }
        } )

        it( `can pack -> unpack floats for u16`, () => {
            const u16writer = createCodecWriter( Format.audio_time_u16 )

            u16writer.initBuffer( floats.length )

            floats.forEach( ( x, i ) => {
                u16writer.buf[i] = squant( x, u16writer.max )
            } )

            const packed = u16writer.pack()

            const unpacked = reader.unpack( packed )

            for ( let i = 0; i < reader.count; i++ ) {
                const x = snorm( reader.nth( i ), reader.max )
                expect( x ).toBeCloseTo( floats[i], 4 )
            }
        } )

        it( `'bytes' read loop is same as 'index' read loop`, () => {
            const u16writer = createCodecWriter( Format.audio_time_u16 )

            u16writer.initBuffer( floats.length )

            floats.forEach( ( x, i ) => {
                u16writer.buf[i] = squant( x, u16writer.max )
            } )

            const packed = u16writer.pack()

            const bytes = reader.unpack( packed )

            let j = 0
            for ( let i = 0; i < bytes.length; i += reader.stride ) {
                const n = i / reader.layout.size // !! index is bytewise
                const raw = reader.read( bytes, i )
                const x = snorm( raw, reader.max )
                expect( x ).toBeCloseTo( floats[n], 1 )
                expect( x ).toBeCloseTo( floats[j], 1 ) // alternate way to index
                j++
            }
        } )

    } )

    describe( `u8`, () => {

        it( `length ${ ints.length }`, () => {
            expect( u8.length ).toBe( ints.length )
        } )

        it( `byte length equals length`, () => {
            expect( u8.byteLength ).toEqual( u8.length )
        } )

        it( `getInt8`, () => {

        } )

    } )

    describe( `u16`, () => {

        it( `length ${ ints.length }`, () => {
            expect( u16.length ).toBe( ints.length )

        } )

        it( `byte length is double length ${ u16.length * 2 }`, () => {
            expect( u16.byteLength ).toEqual( u16.length * 2 )
        } )

    } )

} )