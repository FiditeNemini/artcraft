// This is taken from Microsoft's MIT-licensed k4a libraries.
// From the file `tools/k4aviewer/graphics/shaders/k4apointcloudshaders.h`
#version 430

in vec4 vertexColor;
out vec4 fragmentColor;

in vec2 texCoord;
uniform bool enableShading;

uniform sampler2D objTexture; // C++ method
//layout(location=2, rgba32f) readonly uniform image2D objTexture; // k4a method

void main()
{
    if (vertexColor.a == 0.0f)
    {
        discard;
    }

    fragmentColor = texture2D(objTexture, texCoord); // * 0.80 + color * 0.20;
    //fragmentColor = vertexColor;
}
