import { assert, describe, it } from 'vitest'
import { decode, Format, pack, decodeU16, unpack } from '../src/streams/codec'

describe( 'Codec', () => {

    it( 'should round-trip Vec3_U16 data correctly', () => {
        // 2 vectors of U16 (6 components * 2 bytes = 12 bytes)
        const input = new Uint16Array( [ 1000, 2000, 3000, 4000, 5000, 6000 ] )
        const format = Format.vec3_u16

        const packed = pack( format, input )

        // Header assertions (Manual byte checks)
        assert.equal( packed[0], 1, 'Version should be 1' )
        assert.equal( packed[1], format, 'Format byte should match enum' )
        assert.equal( packed[2], 6, 'Stride should be 6 bytes for Vec3_U16' )
        assert.equal( packed.byteLength, 16, 'Total length should be 4 (header) + 12 (data)' )

        // Unpack and Verify
        const result = unpack( packed )

        assert.isNotNull( result, 'Unpack should return a result object' )
        if ( result ) {
            assert.strictEqual( result.format, format )
            assert.strictEqual( result.stride, 6 )

            // Validate data integrity without a full copy
            const output = new Uint16Array(
                result.bytes.buffer,
                result.bytes.byteOffset,
                result.bytes.byteLength / 2
            )

            assert.deepEqual( Array.from( output ), [ 1000, 2000, 3000, 4000, 5000, 6000 ] )
        }
    } )

    it( 'should handle small Raw_U8 data', () => {
        const input = new Uint8Array( [ 255, 128, 0 ] )
        const packed = pack( Format.raw_u8, input )
        const result = unpack( packed )

        assert.isNotNull( result )
        assert.strictEqual( result?.stride, 1 )
        assert.deepEqual( Array.from( result!.bytes ), [ 255, 128, 0 ] )
    } )

    it( 'should handle Float32 alignment', () => {
        const input = new Float32Array( [ 1.5, -2.5, 3.14 ] )
        const packed = pack( Format.audio_time_f32, input )
        const result = unpack( packed )

        assert.isNotNull( result )
        const output = new Float32Array(
            result!.bytes.buffer,
            result!.bytes.byteOffset,
            result!.bytes.byteLength / 4
        )

        // Use closeTo for floats to avoid precision flakes
        assert.closeTo( output[0], 1.5, 0.0001 )
        assert.closeTo( output[2], 3.14, 0.0001 )
    } )

    it( 'should return null for buffers smaller than header size', () => {
        const tiny = new Uint8Array( [ 0, 1, 2 ] )
        assert.isNull( unpack( tiny ) )
    } )


    describe( 'Usage', () => {

        const vals = [ 1, 11, 2, 22, 3, 33 ]

        const v2 = [
            [ 1, 11 ],
            [ 2, 22 ],
            [ 3, 33 ],
        ]

        const v3 = [
            [ 1, 11, 2 ],
            [ 22, 3, 33 ],
        ]

        it( 'vec2_u8', () => {
            const packed = pack( Format.vec2_u8, new Uint8Array( vals ) )
            const { bytes, stride } = unpack( packed )
            assert.strictEqual( stride, 2 )

            let n = 0;
            for ( let i = 0; i < bytes.length; i += stride ) {
                const vec2 = bytes.subarray( i, i + stride )
                const [ x, y ] = vec2
                assert.deepEqual( v2[n], [ x, y ] )
                n++
            }
        } )

        it( 'vec2_u8 ( with decode )', () => {
            const packed = pack( Format.vec2_u8, new Uint8Array( vals ) )
            const { bytes, stride, step } = decode<Uint8Array>( packed )
            assert.strictEqual( stride, 2 )

            let n = 0;
            for ( let i = 0; i < bytes.length; i += step ) {
                const vec2 = bytes.subarray( i, i + step )
                const [ x, y ] = vec2
                assert.deepEqual( v2[n], [ x, y ] )
                n++
            }
        } )

        it( 'vec2_u16', () => {
            const packed = pack( Format.vec2_u16, new Uint16Array( vals ) )

            // convenience fn
            const { bytes, stride, step } = decodeU16( packed )

            let n = 0;

            // example loop
            for ( let i = 0; i < bytes.length; i += step ) {
                const x = bytes[i]
                const y = bytes[i + 1]
                assert.deepEqual( v2[n], [ x, y ] )
                n++
            }
        } )

        it( 'vec2_u16 ( generic )', () => {
            const packed = pack( Format.vec2_u16, new Uint16Array( vals ) )

            // manual
            const { bytes, stride, step } = decode<Uint16Array>( packed )

            let n = 0;

            // example loop
            for ( let i = 0; i < bytes.length; i += step ) {
                const x = bytes[i]
                const y = bytes[i + 1]
                assert.deepEqual( v2[n], [ x, y ] )
                n++
            }
        } )

        it( 'vec3_u16 ( generic )', () => {
            const packed = pack( Format.vec3_u16, new Uint16Array( vals ) )

            const { bytes, stride, step } = decode<Uint16Array>( packed )

            let n = 0;

            // example loop
            for ( let i = 0; i < bytes.length; i += step ) {
                const x = bytes[i]
                const y = bytes[i + 1]
                const z = bytes[i + 2]
                assert.deepEqual( v3[n], [ x, y, z ] )
                n++
            }
        } )

    } )
} )
