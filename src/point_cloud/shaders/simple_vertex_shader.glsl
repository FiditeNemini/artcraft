//#version 140
#version 420

uniform mat4 view;
uniform mat4 projection;
in vec4 inColor; // UNUSED

layout(rgba32f, binding=0) readonly uniform image2D pointCloudTexture0; // UNUSED
layout(rgba32f, binding=1) readonly uniform image2D pointCloudTexture1; // UNUSED

in vec3 position;
in vec3 normal;

uniform bool enableShading; // UNUSED

out vec3 v_position;
//out vec3 v_normal;

void main() {
    v_position = position;
    //v_normal = normal;
    gl_Position = projection * view * vec4(v_position * 0.005, 1.0);
}