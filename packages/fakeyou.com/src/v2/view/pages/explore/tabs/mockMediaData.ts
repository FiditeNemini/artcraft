const mockMediaData = [
  {
    token: "token1",
    weight_name: "Queen Elizabeth Queen Elizabeth Queen Elizabeth",
    media_type: "audio",
    public_bucket_path:
      "/media/s/p/x/d/2/spxd2xr7nt7zdezyhp61h00kxatr18pf/fakeyou_rvc_spxd2xr7nt7zdezyhp61h00kxatr18pf.wav",
    likes: 150,
    isLiked: true,
    created_at: "2023-08-10T09:00:00.000Z",
    maybe_creator_user: {
      user_token: "1234",
      username: "MelodyMaker123",
      display_name: "MelodyMaker",
      gravatar_hash: "1234",
      default_avatar: {
        image_index: 1,
        color_index: 1,
      },
    },
  },
  {
    token: "token2",
    weight_name: "Monster House",
    media_type: "image",
    public_bucket_path: "/images/dummy-image.jpg",
    likes: 200,
    isLiked: false,
    created_at: "2023-08-10T09:00:00.000Z",
    maybe_creator_user: {
      user_token: "5678",
      username: "ArtisticExplorer",
      display_name: "ArtisticExplorer",
      gravatar_hash: "5678",
      default_avatar: {
        image_index: 2,
        color_index: 2,
      },
    },
  },
  {
    token: "token3",
    weight_name: "Ronaldo",
    media_type: "audio",
    public_bucket_path:
      "/media/s/p/x/d/2/spxd2xr7nt7zdezyhp61h00kxatr18pf/fakeyou_rvc_spxd2xr7nt7zdezyhp61h00kxatr18pf.wav",
    likes: 200,
    isLiked: false,
    created_at: "2023-08-10T09:00:00.000Z",
    maybe_creator_user: {
      user_token: "9012",
      username: "SoccerStar90",
      display_name: "SoccerStar",
      gravatar_hash: "9012",
      default_avatar: {
        image_index: 3,
        color_index: 3,
      },
    },
  },
  {
    token: "token4",
    weight_name: "Desert",
    media_type: "video",
    public_bucket_path: "/images/dummy-video.jpg",
    likes: 150,
    isLiked: true,
    created_at: "2023-08-10T09:00:00.000Z",
    maybe_creator_user: {
      user_token: "3456",
      username: "DesertWanderer",
      display_name: "DesertWanderer",
      gravatar_hash: "3456",
      default_avatar: {
        image_index: 4,
        color_index: 4,
      },
    },
  },
  {
    token: "token5",
    weight_name: "3D Cat",
    media_type: "image",
    public_bucket_path: "/images/dummy-image-2.jpg",
    likes: 200,
    isLiked: false,
    created_at: "2023-08-10T09:00:00.000Z",
    maybe_creator_user: {
      user_token: "7890",
      username: "CatLover78",
      display_name: "CatLover",
      gravatar_hash: "7890",
      default_avatar: {
        image_index: 5,
        color_index: 5,
      },
    },
  },
  {
    token: "token6",
    weight_name: "Superman",
    media_type: "audio",
    public_bucket_path:
      "/media/s/p/x/d/2/spxd2xr7nt7zdezyhp61h00kxatr18pf/fakeyou_rvc_spxd2xr7nt7zdezyhp61h00kxatr18pf.wav",
    likes: 200,
    isLiked: false,
    created_at: "2023-08-10T09:00:00.000Z",
    maybe_creator_user: {
      user_token: "2345",
      username: "SuperheroFan23",
      display_name: "SuperheroFan",
      gravatar_hash: "2345",
      default_avatar: {
        image_index: 1,
        color_index: 2,
      },
    },
  },
  {
    token: "token7",
    weight_name: "Son Goku",
    media_type: "audio",
    public_bucket_path:
      "/media/s/p/x/d/2/spxd2xr7nt7zdezyhp61h00kxatr18pf/fakeyou_rvc_spxd2xr7nt7zdezyhp61h00kxatr18pf.wav",
    likes: 150,
    isLiked: true,
    created_at: "2023-08-10T09:00:00.000Z",
    maybe_creator_user: {
      user_token: "5678",
      username: "DBZFan5678",
      display_name: "DBZFan",
      gravatar_hash: "5678",
      default_avatar: {
        image_index: 2,
        color_index: 3,
      },
    },
  },
  {
    token: "token8",
    weight_name: "Astronaut in Space",
    media_type: "image",
    public_bucket_path: "/images/dummy-image-3.jpg",
    likes: 150,
    isLiked: true,
    created_at: "2023-08-10T09:00:00.000Z",
    maybe_creator_user: {
      user_token: "9012",
      username: "SpaceExplorer90",
      display_name: "SpaceExplorer",
      gravatar_hash: "9012",
      default_avatar: {
        image_index: 3,
        color_index: 4,
      },
    },
  },
  {
    token: "token9",
    weight_name: "Monokuma",
    media_type: "audio",
    public_bucket_path:
      "/media/s/p/x/d/2/spxd2xr7nt7zdezyhp61h00kxatr18pf/fakeyou_rvc_spxd2xr7nt7zdezyhp61h00kxatr18pf.wav",
    likes: 150,
    isLiked: true,
    created_at: "2023-08-10T09:00:00.000Z",
    maybe_creator_user: {
      user_token: "1234",
      username: "MysteriousMask",
      display_name: "MysteriousMask",
      gravatar_hash: "1234",
      default_avatar: {
        image_index: 1,
        color_index: 1,
      },
    },
  },
  {
    token: "token10",
    weight_name: "Watery Landscape",
    media_type: "image",
    public_bucket_path: "/images/dummy-image-4.jpg",
    likes: 150,
    isLiked: true,
    created_at: "2023-08-10T09:00:00.000Z",
    maybe_creator_user: {
      user_token: "2345",
      username: "NatureLover23",
      display_name: "NatureLover",
      gravatar_hash: "2345",
      default_avatar: {
        image_index: 1,
        color_index: 2,
      },
    },
  },
];

export default mockMediaData;
