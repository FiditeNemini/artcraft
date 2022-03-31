// This is taken from Microsoft's MIT-licensed k4a libraries.
// From the file `tools/k4aviewer/graphics/shaders/k4apointcloudshaders.h`
#version 430

in vec4 vertexColor;
out vec4 fragmentColor;

in vec2 texCoord;
uniform bool enableShading;

uniform int vertexType;

uniform sampler2D objTexture; // C++ method
//layout(location=2, rgba32f) readonly uniform image2D objTexture; // k4a method

void main()
{
    if (vertexColor.a == 0.0f)
    {
        discard;
    }

    if (vertexType == 1)
    {
      // Object mode
      vec2 coord = texCoord;
      fragmentColor = texture2D(objTexture, coord);
    }
    else if (vertexType == 2)
    {
      // Point cloud mode
      fragmentColor = vertexColor;
    }

    if (fragmentColor.a == 0.0f)
    {
        discard;
    }
}
