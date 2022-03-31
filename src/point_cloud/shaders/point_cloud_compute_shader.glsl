// This is taken from Microsoft's MIT-licensed k4a libraries.
// From the file `tools/k4aviewer/graphics/shaders/gpudepthtopointcloudconverter.cpp`
#version 430

layout(location=0, rgba32f) writeonly uniform image2D destTex;

layout(location=1, r16ui) readonly uniform uimage2D depthImage;
layout(location=2, rg32f) readonly uniform image2D xyTable;

layout(local_size_x = 1, local_size_y = 1) in;

void main()
{
    ivec2 pixel = ivec2(gl_GlobalInvocationID.xy);

    float vertexValue = float(imageLoad(depthImage, pixel));
    // TODO: The problem is that these are bound to (0.0, 0.0). It isn't working.
    vec2 xyValue = imageLoad(xyTable, pixel).xy;

    float alpha = 1.0f;
    // vertexPosition format: RGB colors as floats, but not range [0.0, 1.0], but rather [0.0, 255.0]
    // HOWEVER, there are operations that reverse the sign of the 'x' channel ('r') and scale down by 1000 below.
    vec3 vertexPosition = vec3(vertexValue * xyValue.x, vertexValue * xyValue.y, vertexValue);

    // Invalid pixels have their XY table values set to 0.
    // Set the rest of their values to 0 so clients can pick them out.
    //
    if (xyValue.x == 0.0f && xyValue.y == 0.0f)
    {
        alpha = 0.0f;
        vertexValue = 0.0f;
    }

    // Vertex positions are in millimeters, but everything else is in meters, so we need to convert
    //
    vertexPosition /= 1000.0f;

    // OpenGL and K4A have different conventions on which direction is positive -
    // we need to flip the X coordinate.
    //
    vertexPosition.x *= -1;

    // Distance Threshold
    // TODO: Make configurable.
    /*if (vertexPosition.z > 1.5) {
        alpha = 0.0f;
        vertexPosition.x = 0.0;
        vertexPosition.y = 0.0;
        vertexPosition.z = 0.0;
    }*/

    imageStore(destTex, pixel, vec4(vertexPosition, alpha));
}
