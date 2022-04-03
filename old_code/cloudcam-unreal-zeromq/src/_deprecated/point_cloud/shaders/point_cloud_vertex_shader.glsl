// This is taken from Microsoft's MIT-licensed k4a libraries.
// From the file `tools/k4aviewer/graphics/shaders/k4apointcloudshaders.h`
#version 430

// NB: It appears that locations need to be wide enough apart, or the colors bleed across locations.
layout(location=0) in vec4 inColor;
//layout(location=10) in vec4 inColor1; // TODO: Get rid of this!

// For use with objects.
// Might restructure the entire program.
in vec3 position;
in vec3 normal;

in vec2 vTextureCoord;
out vec2 texCoord;

out vec4 vertexColor;

// Transformation matrices
uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;

// 1 = object, 2 = pointCloud
uniform int vertexType;

// NB: This is not a scalable approach. But it might work for now.
// 0 = camera0, 1 = camera1
uniform int pointCloudTextureToUse;

layout(rgba32f, binding=0) readonly uniform image2D pointCloudTexture0;
layout(rgba32f, binding=1) readonly uniform image2D pointCloudTexture1;

uniform bool enableShading;

// bool GetPoint3d(in vec2 pointCloudSize, in ivec2 point2d, out vec3 point3d)
// {
//     if (point2d.x < 0 || point2d.x >= pointCloudSize.x ||
//         point2d.y < 0 || point3d.y >= pointCloudSize.y)
//     {
//         return false;
//     }
//
//     point3d = imageLoad(pointCloudTexture0, point2d).xyz;
//     if (point3d.z <= 0)
//     {
//         return false;
//     }
//
//     return true;
// }

void main()
{
    ivec2 pointCloudSize0 = imageSize(pointCloudTexture0);
    int pointCloudLength0 = pointCloudSize0.x * pointCloudSize0.y;

    vec3 vertexPosition;
    vec4 colorOut;

    // We're having to multiplex on gl_VertexID, and I don't think we get double the range for two
    // cameras. This effectively 'downsamples' each camera. We need to find a way to double this.
    // I hate drawing like this
    //if (gl_VertexID < pointCloudLength0) { // TODO - this is the one to enable
    if (gl_VertexID < 10) {
      // Camera #0
      ivec2 currentDepthPixelCoordinates = ivec2(gl_VertexID % pointCloudSize0.x, gl_VertexID / pointCloudSize0.x);

      vertexPosition = imageLoad(pointCloudTexture0, currentDepthPixelCoordinates).xyz;

    } else {
      // Camera #1
      ivec2 pointCloudSize1 = imageSize(pointCloudTexture1);
      int pointCloudLength1 = pointCloudSize1.x * pointCloudSize1.y;

      ivec2 currentDepthPixelCoordinates = ivec2(gl_VertexID % pointCloudSize1.x, gl_VertexID / pointCloudSize1.x);

      // // Let's move the model away a bit.
      // vec3 originalPosition = imageLoad(pointCloudTexture1, currentDepthPixelCoordinates).xyz;
      // vertexPosition = vec3(
      //   originalPosition.x - 1.5,
      //   originalPosition.y,
      //   originalPosition.z
      // );

      vertexPosition = imageLoad(pointCloudTexture1, currentDepthPixelCoordinates).xyz;

      vertexPosition = position;
    }

    if (view[0][0] > 0.5) {
      vertexPosition.x -= 2.0;
      vertexPosition.y -= 2.0;
    }

    vertexColor = colorOut;
    texCoord = vTextureCoord;

    if (vertexType == 1) {
      // Object mode

      vertexColor = colorOut;
      texCoord = vTextureCoord;

    } else if (vertexType == 2) {
      // Point cloud mode

      if (pointCloudTextureToUse == 0)  {
        ivec2 currentDepthPixelCoordinates = ivec2(gl_VertexID % pointCloudSize0.x, gl_VertexID / pointCloudSize0.x);

        vertexPosition = imageLoad(pointCloudTexture0, currentDepthPixelCoordinates).xyz;

        vertexPosition.x += 1.0; // Camera 0 looks best on the left

        colorOut = vec4(
          inColor.r,
          inColor.g,
          inColor.b,
          255
        );

      } else if (pointCloudTextureToUse == 1) {
        ivec2 pointCloudSize1 = imageSize(pointCloudTexture1);
        int pointCloudLength1 = pointCloudSize1.x * pointCloudSize1.y;

        ivec2 currentDepthPixelCoordinates = ivec2(gl_VertexID % pointCloudSize1.x, gl_VertexID / pointCloudSize1.x);

        vertexPosition = imageLoad(pointCloudTexture1, currentDepthPixelCoordinates).xyz;

        vertexPosition.x -= 1.0; // Camera 1 looks best on the right

        colorOut = vec4(
          inColor.r,
          inColor.g,
          inColor.b,
          255
        );
      }

      if (vertexPosition.z > 1.5) {
        // Depth threshold
        // This leads directly to pixel discard
        colorOut.a = 0.0;
      }

      vertexColor = colorOut;
    }

    gl_Position = projection * view * model * vec4(vertexPosition, 1);

    // Pass along the 'invalid pixel' flag as the alpha channel
    //
    // if (vertexPosition.z == 0.0f)
    // {
    //     vertexColor.a = 0.0f;
    // }

    // NB: This is affecting the second camera. Disabling for now.
    // if (enableShading)
    // {
    //     // Compute the location of the closest neighbor pixel to compute lighting
    //     //
    //     vec3 closestNeighbor = vertexPosition;
    //
    //     // If no neighbors have data, default to 1 meter behind point.
    //     //
    //     closestNeighbor.z += 1.0f;
    //
    //     vec3 outPoint;
    //     if (GetPoint3d(pointCloudSize, currentDepthPixelCoordinates - ivec2(1, 0), outPoint))
    //     {
    //         if (closestNeighbor.z > outPoint.z)
    //         {
    //             closestNeighbor = outPoint;
    //         }
    //     }
    //     if (GetPoint3d(pointCloudSize, currentDepthPixelCoordinates + ivec2(1, 0), outPoint))
    //     {
    //         if (closestNeighbor.z > outPoint.z)
    //         {
    //             closestNeighbor = outPoint;
    //         }
    //     }
    //     if (GetPoint3d(pointCloudSize, currentDepthPixelCoordinates - ivec2(0, 1), outPoint))
    //     {
    //         if (closestNeighbor.z > outPoint.z)
    //         {
    //             closestNeighbor = outPoint;
    //         }
    //     }
    //     if (GetPoint3d(pointCloudSize, currentDepthPixelCoordinates + ivec2(0, 1), outPoint))
    //     {
    //         if (closestNeighbor.z > outPoint.z)
    //         {
    //             closestNeighbor = outPoint;
    //         }
    //     }
    //
    //     vec3 lightPosition = vec3(0, 0, 0);
    //     float occlusion = length(vertexPosition - closestNeighbor) * 20.0f;
    //     float diffuse = 1.0f - clamp(occlusion, 0.0f, 0.6f);
    //
    //     float distance = length(lightPosition - vertexPosition);
    //
    //     // Attenuation term for light source that covers distance up to 50 meters
    //     // http://wiki.ogre3d.org/tiki-index.php?page=-Point+Light+Attenuation
    //     //
    //     float attenuation = 1.0 / (1.0 + 0.09 * distance + 0.032 * distance * distance);
    //
    //     vertexColor = vec4(attenuation * diffuse * vertexColor.rgb, vertexColor.a);
    // }
}
