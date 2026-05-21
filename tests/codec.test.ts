import { assert, describe, it } from 'vitest'
import { CodecLayout, Format, pack, unpack } from '../src/streams/codec/codec'
import { decode, decodeU16 } from "../src/streams/codec/decode";

describe.only( 'Codec', () => {

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
        const um: CodecLayout = {}
        const bytes = unpack( packed, um )

        assert.isNotNull( bytes, 'Unpack should return a result object' )

        if ( bytes ) {
            assert.strictEqual( um.format, format )
            assert.strictEqual( um.stride, 6 )

            // Validate data integrity without a full copy
            const output = new Uint16Array(
                bytes.buffer,
                bytes.byteOffset,
                bytes.byteLength / 2
            )

            assert.deepEqual( Array.from( output ), [ 1000, 2000, 3000, 4000, 5000, 6000 ] )
        }
    } )

    it( 'should handle small Raw_U8 data', () => {
        const input = new Uint8Array( [ 255, 128, 0 ] )
        const packed = pack( Format.raw_u8, input )
        const um: CodecLayout = {}
        const bytes = unpack( packed, um )

        assert.isNotNull( bytes )
        assert.strictEqual( um.stride, 1 )
        assert.deepEqual( Array.from( bytes ), [ 255, 128, 0 ] )
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

            const lay: CodecLayout = {}
            const bytes = unpack( packed, lay )
            assert.strictEqual( lay.stride, 2 )

            let n = 0;
            for ( let i = 0; i < bytes.length; i += lay.stride ) {
                const vec2 = bytes.subarray( i, i + lay.stride )
                const [ x, y ] = vec2
                assert.deepEqual( v2[n], [ x, y ] )
                n++
            }
        } )

        it( 'vec2_u8 ( with decode )', () => {
            const packed = pack( Format.vec2_u8, new Uint8Array( vals ) )

            const lay: CodecLayout = {}
            const data = decode<Uint8Array>( packed, lay )

            assert.strictEqual( lay.stride, 2 )
            assert.isNotNull( data )

            let n = 0;
            for ( let i = 0; i < data.length; i += 2 ) {
                const vec2 = data.subarray( i, i + 2 )
                const [ x, y ] = vec2
                assert.deepEqual( v2[n], [ x, y ] )
                n++
            }
        } )

        it( 'vec2_u16', () => {
            const packed = pack( Format.vec2_u16, new Uint16Array( vals ) )

            const lay: CodecLayout = {}
            const data = decodeU16( packed, lay )

            let n = 0;
            for ( let i = 0; i < data.length; i += 2 ) {
                const x = data[i]
                const y = data[i + 1]
                assert.deepEqual( v2[n], [ x, y ] )
                n++
            }
        } )

        it( 'vec2_u16 ( generic )', () => {
            const packed = pack( Format.vec2_u16, new Uint16Array( vals ) )

            const lay: CodecLayout = {}
            const data = decode<Uint16Array>( packed, lay )

            let n = 0;
            for ( let i = 0; i < data.length; i += 2 ) {
                const x = data[i]
                const y = data[i + 1]
                assert.deepEqual( v2[n], [ x, y ] )
                n++
            }
        } )

        it( 'vec3_u16 ( generic )', () => {
            const packed = pack( Format.vec3_u16, new Uint16Array( vals ) )

            const lay: CodecLayout = {}
            const data = decode<Uint16Array>( packed, lay )

            let n = 0;
            for ( let i = 0; i < data.length; i += 3 ) {
                const x = data[i]
                const y = data[i + 1]
                const z = data[i + 2]
                assert.deepEqual( v3[n], [ x, y, z ] )
                n++
            }
        } )

    } )
} )
