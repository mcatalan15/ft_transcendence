'use strict';

var _const = require('./const.js');

"use strict";
function parseDDS(arrayBuffer, supportedFormats) {
  const {
    format,
    fourCC,
    width,
    height,
    dataOffset,
    mipmapCount
  } = parseDDSHeader(arrayBuffer);
  if (!supportedFormats.includes(format)) {
    throw new Error(`Unsupported texture format: ${fourCC} ${format}, supported: ${supportedFormats}`);
  }
  if (mipmapCount <= 1) {
    return {
      format,
      width,
      height,
      resource: [new Uint8Array(arrayBuffer, dataOffset)],
      alphaMode: "no-premultiply-alpha"
    };
  }
  const levelBuffers = getMipmapLevelBuffers(format, width, height, dataOffset, mipmapCount, arrayBuffer);
  const textureOptions = {
    format,
    width,
    height,
    resource: levelBuffers,
    alphaMode: "no-premultiply-alpha"
  };
  return textureOptions;
}
function getMipmapLevelBuffers(format, width, height, dataOffset, mipmapCount, arrayBuffer) {
  const levelBuffers = [];
  const blockBytes = _const.TEXTURE_FORMAT_BLOCK_SIZE[format];
  let mipWidth = width;
  let mipHeight = height;
  let offset = dataOffset;
  for (let level = 0; level < mipmapCount; ++level) {
    const alignedWidth = Math.ceil(Math.max(4, mipWidth) / 4) * 4;
    const alignedHeight = Math.ceil(Math.max(4, mipHeight) / 4) * 4;
    const byteLength = blockBytes ? alignedWidth / 4 * alignedHeight / 4 * blockBytes : mipWidth * mipHeight * 4;
    const levelBuffer = new Uint8Array(arrayBuffer, offset, byteLength);
    levelBuffers.push(levelBuffer);
    offset += byteLength;
    mipWidth = Math.max(mipWidth >> 1, 1);
    mipHeight = Math.max(mipHeight >> 1, 1);
  }
  return levelBuffers;
}
function parseDDSHeader(buffer) {
  const header = new Uint32Array(buffer, 0, _const.DDS.HEADER_SIZE / Uint32Array.BYTES_PER_ELEMENT);
  if (header[_const.DDS.HEADER_FIELDS.MAGIC] !== _const.DDS.MAGIC_VALUE) {
    throw new Error("Invalid magic number in DDS header");
  }
  const height = header[_const.DDS.HEADER_FIELDS.HEIGHT];
  const width = header[_const.DDS.HEADER_FIELDS.WIDTH];
  const mipmapCount = Math.max(1, header[_const.DDS.HEADER_FIELDS.MIPMAP_COUNT]);
  const flags = header[_const.DDS.HEADER_FIELDS.PF_FLAGS];
  const fourCC = header[_const.DDS.HEADER_FIELDS.FOURCC];
  const format = getTextureFormat(header, flags, fourCC, buffer);
  const dataOffset = _const.DDS.MAGIC_SIZE + _const.DDS.HEADER_SIZE + (fourCC === _const.DDS.D3DFMT.DX10 ? _const.DDS.HEADER_DX10_SIZE : 0);
  return {
    format,
    fourCC,
    width,
    height,
    dataOffset,
    mipmapCount
  };
}
function getTextureFormat(header, flags, fourCC, buffer) {
  if (flags & _const.DDS.PIXEL_FORMAT_FLAGS.FOURCC) {
    if (fourCC === _const.DDS.D3DFMT.DX10) {
      const dx10Header = new Uint32Array(
        buffer,
        _const.DDS.MAGIC_SIZE + _const.DDS.HEADER_SIZE,
        // there is a 20-byte DDS_HEADER_DX10 after DDS_HEADER
        _const.DDS.HEADER_DX10_SIZE / Uint32Array.BYTES_PER_ELEMENT
      );
      const miscFlag = dx10Header[_const.DDS.HEADER_DX10_FIELDS.MISC_FLAG];
      if (miscFlag === _const.DDS.RESOURCE_MISC_TEXTURECUBE) {
        throw new Error("DDSParser does not support cubemap textures");
      }
      const resourceDimension = dx10Header[_const.DDS.HEADER_DX10_FIELDS.RESOURCE_DIMENSION];
      if (resourceDimension === _const.DDS.D3D10_RESOURCE_DIMENSION.DDS_DIMENSION_TEXTURE3D) {
        throw new Error("DDSParser does not supported 3D texture data");
      }
      const dxgiFormat = dx10Header[_const.DDS.HEADER_DX10_FIELDS.DXGI_FORMAT];
      if (dxgiFormat in _const.DXGI_TO_TEXTURE_FORMAT) {
        return _const.DXGI_TO_TEXTURE_FORMAT[dxgiFormat];
      }
      throw new Error(`DDSParser cannot parse texture data with DXGI format ${dxgiFormat}`);
    }
    if (fourCC in _const.FOURCC_TO_TEXTURE_FORMAT) {
      return _const.FOURCC_TO_TEXTURE_FORMAT[fourCC];
    }
    throw new Error(`DDSParser cannot parse texture data with fourCC format ${fourCC}`);
  }
  if (flags & _const.DDS.PIXEL_FORMAT_FLAGS.RGB || flags & _const.DDS.PIXEL_FORMAT_FLAGS.RGBA) {
    return getUncompressedTextureFormat(header);
  }
  if (flags & _const.DDS.PIXEL_FORMAT_FLAGS.YUV) {
    throw new Error("DDSParser does not supported YUV uncompressed texture data.");
  }
  if (flags & _const.DDS.PIXEL_FORMAT_FLAGS.LUMINANCE || flags & _const.DDS.PIXEL_FORMAT_FLAGS.LUMINANCEA) {
    throw new Error("DDSParser does not support single-channel (lumninance) texture data!");
  }
  if (flags & _const.DDS.PIXEL_FORMAT_FLAGS.ALPHA || flags & _const.DDS.PIXEL_FORMAT_FLAGS.ALPHAPIXELS) {
    throw new Error("DDSParser does not support single-channel (alpha) texture data!");
  }
  throw new Error("DDSParser failed to load a texture file due to an unknown reason!");
}
function getUncompressedTextureFormat(header) {
  const bitCount = header[_const.DDS.HEADER_FIELDS.RGB_BITCOUNT];
  const rBitMask = header[_const.DDS.HEADER_FIELDS.R_BIT_MASK];
  const gBitMask = header[_const.DDS.HEADER_FIELDS.G_BIT_MASK];
  const bBitMask = header[_const.DDS.HEADER_FIELDS.B_BIT_MASK];
  const aBitMask = header[_const.DDS.HEADER_FIELDS.A_BIT_MASK];
  switch (bitCount) {
    case 32:
      if (rBitMask === 255 && gBitMask === 65280 && bBitMask === 16711680 && aBitMask === 4278190080) {
        return _const.DXGI_TO_TEXTURE_FORMAT[_const.DDS.DXGI_FORMAT.DXGI_FORMAT_R8G8B8A8_UNORM];
      }
      if (rBitMask === 16711680 && gBitMask === 65280 && bBitMask === 255 && aBitMask === 4278190080) {
        return _const.DXGI_TO_TEXTURE_FORMAT[_const.DDS.DXGI_FORMAT.DXGI_FORMAT_B8G8R8A8_UNORM];
      }
      if (rBitMask === 1072693248 && gBitMask === 1047552 && bBitMask === 1023 && aBitMask === 3221225472) {
        return _const.DXGI_TO_TEXTURE_FORMAT[_const.DDS.DXGI_FORMAT.DXGI_FORMAT_R10G10B10A2_UNORM];
      }
      if (rBitMask === 65535 && gBitMask === 4294901760 && bBitMask === 0 && aBitMask === 0) {
        return _const.DXGI_TO_TEXTURE_FORMAT[_const.DDS.DXGI_FORMAT.DXGI_FORMAT_R16G16_UNORM];
      }
      if (rBitMask === 4294967295 && gBitMask === 0 && bBitMask === 0 && aBitMask === 0) {
        return _const.DXGI_TO_TEXTURE_FORMAT[_const.DDS.DXGI_FORMAT.DXGI_FORMAT_R32_FLOAT];
      }
      break;
    case 24:
      if (rBitMask === 16711680 && gBitMask === 65280 && bBitMask === 255 && aBitMask === 32768) {
      }
      break;
    case 16:
      if (rBitMask === 31744 && gBitMask === 992 && bBitMask === 31 && aBitMask === 32768) {
        return _const.DXGI_TO_TEXTURE_FORMAT[_const.DDS.DXGI_FORMAT.DXGI_FORMAT_B5G5R5A1_UNORM];
      }
      if (rBitMask === 63488 && gBitMask === 2016 && bBitMask === 31 && aBitMask === 0) {
        return _const.DXGI_TO_TEXTURE_FORMAT[_const.DDS.DXGI_FORMAT.DXGI_FORMAT_B5G6R5_UNORM];
      }
      if (rBitMask === 3840 && gBitMask === 240 && bBitMask === 15 && aBitMask === 61440) {
        return _const.DXGI_TO_TEXTURE_FORMAT[_const.DDS.DXGI_FORMAT.DXGI_FORMAT_B4G4R4A4_UNORM];
      }
      if (rBitMask === 255 && gBitMask === 0 && bBitMask === 0 && aBitMask === 65280) {
        return _const.DXGI_TO_TEXTURE_FORMAT[_const.DDS.DXGI_FORMAT.DXGI_FORMAT_R8G8_UNORM];
      }
      if (rBitMask === 65535 && gBitMask === 0 && bBitMask === 0 && aBitMask === 0) {
        return _const.DXGI_TO_TEXTURE_FORMAT[_const.DDS.DXGI_FORMAT.DXGI_FORMAT_R16_UNORM];
      }
      break;
    case 8:
      if (rBitMask === 255 && gBitMask === 0 && bBitMask === 0 && aBitMask === 0) {
        return _const.DXGI_TO_TEXTURE_FORMAT[_const.DDS.DXGI_FORMAT.DXGI_FORMAT_R8_UNORM];
      }
      break;
  }
  throw new Error(`DDSParser does not support uncompressed texture with configuration:
                bitCount = ${bitCount}, rBitMask = ${rBitMask}, gBitMask = ${gBitMask}, aBitMask = ${aBitMask}`);
}

exports.parseDDS = parseDDS;
//# sourceMappingURL=parseDDS.js.map
