import { MeshGeometry } from '../../mesh/shared/MeshGeometry.mjs';

"use strict";
class QuadGeometry extends MeshGeometry {
  constructor() {
    super({
      positions: new Float32Array([0, 0, 1, 0, 1, 1, 0, 1]),
      uvs: new Float32Array([0, 0, 1, 0, 1, 1, 0, 1]),
      indices: new Uint32Array([0, 1, 2, 0, 2, 3])
    });
  }
}

export { QuadGeometry };
//# sourceMappingURL=QuadGeometry.mjs.map
