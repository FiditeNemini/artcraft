// This is taken from Microsoft's MIT-licensed k4a libraries.
// From the file `tools/k4aviewer/graphics/shaders/k4apointcloudshaders.h`
#version 430

in vec4 vertexColor;
out vec4 fragmentColor;

uniform bool enableShading;

void main()
{
    if (vertexColor.a == 0.0f)
    {
        discard;
    }

    fragmentColor = vertexColor;
}
