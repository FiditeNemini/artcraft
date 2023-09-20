//! Loads and renders a glTF file as a scene.

use core::time::Duration;
use std::f32::consts::*;

use bevy::{
  animation::{AnimationClip, AnimationPlayer},
  pbr::{CascadeShadowConfigBuilder, DirectionalLightShadowMap},
  prelude::*,
  scene::SceneInstance,
};
use bevy::input::mouse::MouseMotion;

fn main() {
    App::new()
        .insert_resource(AmbientLight {
            color: Color::WHITE,
            brightness: 1.0 / 5.0f32,
        })
        .insert_resource(DirectionalLightShadowMap { size: 4096 })
        .add_plugins(DefaultPlugins)
        .add_startup_system(setup)
        .add_system(setup_scene_once_loaded)
        //.add_system(animate_light_direction)
        //.add_system(animate_model_direction)
        .add_system(keyboard_animation_control)
        .add_system(camera_controller)
        .add_system(text_update_system)
        .run();
}

#[derive(Resource)]
struct Animations(Vec<Handle<AnimationClip>>);

#[derive(Component)]
struct PosText;

#[derive(Component)]
struct RotText;

#[derive(Component)]
struct MainCamera;

fn setup(mut commands: Commands, asset_server: Res<AssetServer>) {

        
    commands.insert_resource(Animations(vec![
        asset_server.load("Roko_Anim_Wave_noOptimization.glb#Animation0"),
    ]));


    commands.spawn((
        Camera3dBundle {
            transform: Transform::from_xyz(0.0, 1.5, 1.5),
            //transform: Transform {
                //translation: Vec3::new(0.0, -10.0, 5.0),
                //rotation: Quat::from_xyzw(0.574, 0.0, 0.0, 0.819),
                //scale: Vec3::new(1.0, 1.0, 1.0),
            //},
            //projection: Projection::Orthographic(OrthographicProjection{
                    //near: 0.1,
                    //far: 100.0,
                    //scale: 7.312,
                    //..default()
                //}
            //),
            ..default()
        },
        MainCamera,
        CameraController::default(),
        EnvironmentMapLight {
            diffuse_map: asset_server.load("pisa_diffuse_rgb9e5_zstd.ktx2"),
            specular_map: asset_server.load("pisa_specular_rgb9e5_zstd.ktx2"),
        },
    ));

        commands.spawn((
            TextBundle::from_sections([
                TextSection::new(
                    "Position: ",
                    TextStyle {
                        font: asset_server.load("fonts/FiraSans-Bold.ttf"),
                        font_size: 20.0,
                        color: Color::WHITE,
                    },
                ),
                TextSection::new(
                    "X: ",
                    TextStyle {
                        font: asset_server.load("fonts/FiraSans-Bold.ttf"),
                        font_size: 20.0,
                        color: Color::WHITE,
                    },
                ),
                TextSection::from_style(TextStyle {
                    font: asset_server.load("fonts/FiraMono-Medium.ttf"),
                    font_size: 20.0,
                    color: Color::GOLD,
                }),
                TextSection::new(
                    "Y: ",
                    TextStyle {
                        font: asset_server.load("fonts/FiraSans-Bold.ttf"),
                        font_size: 20.0,
                        color: Color::WHITE,
                    },
                ),
                TextSection::from_style(TextStyle {
                    font: asset_server.load("fonts/FiraMono-Medium.ttf"),
                    font_size: 20.0,
                    color: Color::GOLD,
                }),
                TextSection::new(
                    "Z: ",
                    TextStyle {
                        font: asset_server.load("fonts/FiraSans-Bold.ttf"),
                        font_size: 20.0,
                        color: Color::WHITE,
                    },
                ),
                TextSection::from_style(TextStyle {
                    font: asset_server.load("fonts/FiraMono-Medium.ttf"),
                    font_size: 20.0,
                    color: Color::GOLD,
                }),
         
            ]).with_style(
                Style {
                    position_type: PositionType::Absolute,
                    position: UiRect {
                        right: Val::Px(00.0),
                        ..default()
                    },
                    ..default()
                }
            ),

            PosText,
        ));

        commands.spawn((
            TextBundle::from_sections([
                TextSection::new(
                    "Rotation: ",
                    TextStyle {
                        font: asset_server.load("fonts/FiraSans-Bold.ttf"),
                        font_size: 20.0,
                        color: Color::WHITE,
                    },
                ),
                TextSection::new(
                    "X: ",
                    TextStyle {
                        font: asset_server.load("fonts/FiraSans-Bold.ttf"),
                        font_size: 20.0,
                        color: Color::WHITE,
                    },
                ),
                TextSection::from_style(TextStyle {
                    font: asset_server.load("fonts/FiraMono-Medium.ttf"),
                    font_size: 20.0,
                    color: Color::GOLD,
                }),
                TextSection::new(
                    "Y: ",
                    TextStyle {
                        font: asset_server.load("fonts/FiraSans-Bold.ttf"),
                        font_size: 20.0,
                        color: Color::WHITE,
                    },
                ),
                TextSection::from_style(TextStyle {
                    font: asset_server.load("fonts/FiraMono-Medium.ttf"),
                    font_size: 20.0,
                    color: Color::GOLD,
                }),
                TextSection::new(
                    "Z: ",
                    TextStyle {
                        font: asset_server.load("fonts/FiraSans-Bold.ttf"),
                        font_size: 20.0,
                        color: Color::WHITE,
                    },
                ),
                TextSection::from_style(TextStyle {
                    font: asset_server.load("fonts/FiraMono-Medium.ttf"),
                    font_size: 20.0,
                    color: Color::GOLD,
                }),
                TextSection::new(
                    "W: ",
                    TextStyle {
                        font: asset_server.load("fonts/FiraSans-Bold.ttf"),
                        font_size: 20.0,
                        color: Color::WHITE,
                    },
                ),
                TextSection::from_style(TextStyle {
                    font: asset_server.load("fonts/FiraMono-Medium.ttf"),
                    font_size: 20.0,
                    color: Color::GOLD,
                }),
            ]).with_style(
                Style {
                    position_type: PositionType::Absolute,
                    position: UiRect {
                        top: Val::Px(20.0),
                        right: Val::Px(00.0),
                        ..default()
                    },
                    ..default()
                }
            ),
            RotText,
        ));



    commands.spawn(DirectionalLightBundle {
        directional_light: DirectionalLight {
            shadows_enabled: true,
            ..default()
        },
        // This is a relatively small scene, so use tighter shadow
        // cascade bounds than the default for better quality.
        // We also adjusted the shadow map to be larger since we're
        // only using a single cascade.
        cascade_shadow_config: CascadeShadowConfigBuilder {
            num_cascades: 1,
            maximum_distance: 1.6,
            ..default()
        }
        .into(),
        transform: Transform {
            translation: Vec3::new(0.0, 0.0, 0.0),
            rotation: Quat::from_xyzw(-0.5, 0.0, 0.0, 0.8517),
            scale: Vec3::ONE,
        },
        ..default()
    });
    commands.spawn(SceneBundle {
        scene: asset_server.load("Roko_nogamerig.glb#Scene0"),
        transform: Transform::from_xyz(0.0, 0.0, 0.0),
        //transform: Transform::from_rotation(Quat::from_rotation_x(3.14)),
        ..default()
    });

    //commands.spawn(AnimationPlayer::default());

}

fn animate_light_direction(
    time: Res<Time>,
    mut query: Query<&mut Transform, With<DirectionalLight>>,
) {
    for mut transform in &mut query {
        transform.rotation = Quat::from_euler(
            EulerRot::ZYX,
            0.0,
            1.0 * PI,
            -FRAC_PI_4,
        );
    }
}

fn animate_model_direction(
    time: Res<Time>,
    mut query: Query<&mut Transform, With<SceneInstance>>,
) {
    for mut transform in &mut query {
        transform.rotation = Quat::from_euler(
            EulerRot::XYZ,
            0.0,
            1.0 * PI,
            0.0,
        );
    }
}

// Once the scene is loaded, start the animation
fn setup_scene_once_loaded(
    animations: Res<Animations>,
    mut player: Query<&mut AnimationPlayer>,
    mut done: Local<bool>,
) {
    if !*done {
        if let Ok(mut player) = player.get_single_mut() {
            player.play(animations.0[0].clone_weak()).repeat();
            *done = true;
        }
    }
}

//fn play_animation(
    //mut animation_player: Query<&mut AnimationPlayer>,
    //animations: Res<Animations>,
    //mut done: Local<bool>,
    //time: Res<Time>,
    //assets: Res<Assets<AnimationClip>>,
//) {
    //if !*done {
        //if let Ok(mut player) = animation_player.get_single_mut() {
            ////println!("{:#?}", *assets.get(&animations.0[0]).unwrap().curves());
            //player.play(animations.0[0].clone_weak()).repeat();
            //*done = true;
        //} else {
            //println!("fail?!");
        //}
    //}


fn keyboard_animation_control(
    keyboard_input: Res<Input<KeyCode>>,
    mut animation_player: Query<&mut AnimationPlayer>,
    animations: Res<Animations>,
    mut current_animation: Local<usize>,
) {
    if let Ok(mut player) = animation_player.get_single_mut() {
        if keyboard_input.just_pressed(KeyCode::Space) {
            if player.is_paused() {
                player.resume();
            } else {
                player.pause();
            }
        }

        if keyboard_input.just_pressed(KeyCode::Up) {
            let speed = player.speed();
            player.set_speed(speed * 1.2);
        }

        if keyboard_input.just_pressed(KeyCode::Down) {
            let speed = player.speed();
            player.set_speed(speed * 0.8);
        }

        if keyboard_input.just_pressed(KeyCode::Left) {
            let elapsed = player.elapsed();
            player.set_elapsed(elapsed - 0.1);
        }

        if keyboard_input.just_pressed(KeyCode::Right) {
            let elapsed = player.elapsed();
            player.set_elapsed(elapsed + 0.1);
        }

        if keyboard_input.just_pressed(KeyCode::Return) {
            *current_animation = (*current_animation + 1) % animations.0.len();
            player
                .play_with_transition(
                    animations.0[*current_animation].clone_weak(),
                    Duration::from_millis(250),
                )
                .repeat();
        }
    }
}

#[derive(Component)]
pub struct CameraController {
    pub enabled: bool,
    pub initialized: bool,
    pub sensitivity: f32,
    pub key_forward: KeyCode,
    pub key_back: KeyCode,
    pub key_left: KeyCode,
    pub key_right: KeyCode,
    pub key_up: KeyCode,
    pub key_down: KeyCode,
    pub key_run: KeyCode,
    pub mouse_key_enable_mouse: MouseButton,
    pub keyboard_key_enable_mouse: KeyCode,
    pub walk_speed: f32,
    pub run_speed: f32,
    pub friction: f32,
    pub pitch: f32,
    pub yaw: f32,
    pub velocity: Vec3,
}

impl Default for CameraController {
    fn default() -> Self {
        Self {
            enabled: true,
            initialized: false,
            sensitivity: 0.5,
            key_forward: KeyCode::W,
            key_back: KeyCode::S,
            key_left: KeyCode::A,
            key_right: KeyCode::D,
            key_up: KeyCode::E,
            key_down: KeyCode::Q,
            key_run: KeyCode::LShift,
            mouse_key_enable_mouse: MouseButton::Left,
            keyboard_key_enable_mouse: KeyCode::M,
            walk_speed: 2.0,
            run_speed: 6.0,
            friction: 0.5,
            pitch: 0.0,
            yaw: 0.0,
            velocity: Vec3::ZERO,
        }
    }
}

pub fn camera_controller(
    time: Res<Time>,
    mut mouse_events: EventReader<MouseMotion>,
    mouse_button_input: Res<Input<MouseButton>>,
    key_input: Res<Input<KeyCode>>,
    mut move_toggled: Local<bool>,
    mut query: Query<(&mut Transform, &mut CameraController), With<Camera>>,
) {
    let dt = time.delta_seconds();

    if let Ok((mut transform, mut options)) = query.get_single_mut() {
        if !options.initialized {
            let (yaw, pitch, _roll) = transform.rotation.to_euler(EulerRot::YXZ);
            options.yaw = yaw;
            options.pitch = pitch;
            options.initialized = true;
        }
        if !options.enabled {
            return;
        }

        // Handle key input
        let mut axis_input = Vec3::ZERO;
        if key_input.pressed(options.key_forward) {
            axis_input.z += 1.0;
        }
        if key_input.pressed(options.key_back) {
            axis_input.z -= 1.0;
        }
        if key_input.pressed(options.key_right) {
            axis_input.x += 1.0;
        }
        if key_input.pressed(options.key_left) {
            axis_input.x -= 1.0;
        }
        if key_input.pressed(options.key_up) {
            axis_input.y += 1.0;
        }
        if key_input.pressed(options.key_down) {
            axis_input.y -= 1.0;
        }
        if key_input.just_pressed(options.keyboard_key_enable_mouse) {
            *move_toggled = !*move_toggled;
        }

        // Apply movement update
        if axis_input != Vec3::ZERO {
            let max_speed = if key_input.pressed(options.key_run) {
                options.run_speed
            } else {
                options.walk_speed
            };
            options.velocity = axis_input.normalize() * max_speed;
        } else {
            let friction = options.friction.clamp(0.0, 1.0);
            options.velocity *= 1.0 - friction;
            if options.velocity.length_squared() < 1e-6 {
                options.velocity = Vec3::ZERO;
            }
        }
        let forward = transform.forward();
        let right = transform.right();
        transform.translation += options.velocity.x * dt * right
            + options.velocity.y * dt * Vec3::Y
            + options.velocity.z * dt * forward;

        // Handle mouse input
        let mut mouse_delta = Vec2::ZERO;
        if mouse_button_input.pressed(options.mouse_key_enable_mouse) || *move_toggled {
            for mouse_event in mouse_events.iter() {
                mouse_delta += mouse_event.delta;
            }
        }

        if mouse_delta != Vec2::ZERO {
            // Apply look update
            options.pitch = (options.pitch - mouse_delta.y * 0.5 * options.sensitivity * dt)
                .clamp(-PI / 2., PI / 2.);
            options.yaw -= mouse_delta.x * options.sensitivity * dt;
            transform.rotation = Quat::from_euler(EulerRot::ZYX, 0.0, options.yaw, options.pitch);
        }
    }
}

fn text_update_system(camera_q: Query<(&Camera, &GlobalTransform), With<MainCamera>>,
    windows: Query<&mut Window>,
    mut pos_text: Query<&mut Text, With<PosText>>,
    mut rot_text: Query<&mut Text, Without<PosText>>
) {
    let (camera, camera_transform) = camera_q.single();
    let window = windows.get_single().unwrap();
    let transform = camera_transform.compute_transform();

    let position = transform.translation;
    let rotation = transform.rotation;
    for mut text in &mut pos_text {
        text.sections[2].value = format!("{:.2} ", position.x);
        text.sections[4].value = format!("{:.2} ", position.y);
        text.sections[6].value = format!("{:.2} ", position.z);
    }
    for mut text in &mut rot_text {
        text.sections[2].value = format!("{:.4} ", rotation.x);
        text.sections[4].value = format!("{:.4} ", rotation.y);
        text.sections[6].value = format!("{:.4} ", rotation.z);
        text.sections[8].value = format!("{:.4} ", rotation.w);
    }
    
}
