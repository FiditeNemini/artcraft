let mockWeightsData = [
  {
    token: "token1",
    weight_name: "Queen Elizabeth",
    media_type: "audio",
    public_bucket_path:
      "/media/s/p/x/d/2/spxd2xr7nt7zdezyhp61h00kxatr18pf/fakeyou_rvc_spxd2xr7nt7zdezyhp61h00kxatr18pf.wav",
    likes: 150,
    isLiked: true,
    created_at: "2023-08-10T09:00:00.000Z",
  },
  {
    token: "token2",
    weight_name: "Monster House",
    media_type: "image",
    public_bucket_path: "/images/dummy-image.jpg",
    likes: 200,
    isLiked: false,
    created_at: "2023-08-10T09:00:00.000Z",
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
  },
  {
    token: "token5",
    weight_name: "3D Cat",
    media_type: "image",
    public_bucket_path: "/images/dummy-image-2.jpg",
    likes: 200,
    isLiked: false,
    created_at: "2023-08-10T09:00:00.000Z",
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
  },
];

// Randomize the order of the array
for (let i = mockWeightsData.length - 1; i > 0; i--) {
  const j = Math.floor(Math.random() * (i + 1));
  [mockWeightsData[i], mockWeightsData[j]] = [
    mockWeightsData[j],
    mockWeightsData[i],
  ];
}

// Update the 'token' property to start at 1
mockWeightsData.forEach((item, index) => {
  item.token = `token${index + 1}`;
});

export default mockWeightsData;
