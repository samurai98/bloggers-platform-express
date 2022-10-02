import { Router, Request, Response } from "express";

export const videosRouter = Router({});

const resolutions = [
  "P144",
  "P240",
  "P360",
  "P480",
  "P720",
  "P1080",
  "P1440",
  "P2160",
] as const;

type Video = {
  id: number;
  title: string;
  author: string;
  canBeDownloaded: boolean;
  minAgeRestriction: number | null;
  createdAt: string;
  publicationDate: string;
  availableResolutions: typeof resolutions;
};

type ErrorMessage = { field: keyof Video; message: string };

const videos: Video[] = [];

const checkVideoError = ({
  title,
  author,
  availableResolutions,
  canBeDownloaded,
  minAgeRestriction,
  publicationDate,
}: Partial<Video>): ErrorMessage[] => {
  const errorsMessages: ErrorMessage[] = [];

  if (!title || typeof title !== "string" || title.length > 40)
    errorsMessages.push({ field: "title", message: "Incorrect 'title' field" });

  if (!author || typeof author !== "string" || author.length > 20)
    errorsMessages.push({
      field: "author",
      message: "Incorrect 'author' field",
    });

  if (
    !availableResolutions ||
    availableResolutions.findIndex((el) => !resolutions.includes(el)) !== -1
  )
    errorsMessages.push({
      field: "availableResolutions",
      message: "Incorrect 'availableResolutions' field",
    });

  if (canBeDownloaded && typeof canBeDownloaded !== "boolean")
    errorsMessages.push({
      field: "canBeDownloaded",
      message: "Incorrect 'canBeDownloaded' field",
    });

  if (
    minAgeRestriction &&
    (typeof minAgeRestriction !== "number" ||
      minAgeRestriction > 18 ||
      minAgeRestriction < 1)
  )
    errorsMessages.push({
      field: "minAgeRestriction",
      message: "Incorrect 'minAgeRestriction' field",
    });

  if (publicationDate && typeof publicationDate !== "string")
    errorsMessages.push({
      field: "publicationDate",
      message: "Incorrect 'publicationDate' field",
    });

  return errorsMessages;
};

videosRouter.get("/", (req: Request, res: Response) => {
  res.send(videos);
});

videosRouter.get("/:id", (req: Request, res: Response) => {
  const video = videos.find((p) => p.id === Number(req.params.id));

  if (video) res.send(video);
  else res.send(404);
});

videosRouter.post(
  "/",
  (
    req: Request<undefined, undefined, Partial<Video>>,
    res: Response<Video | { errorsMessages: ErrorMessage[] }>
  ) => {
    const errorsMessages = checkVideoError(req.body);

    if (errorsMessages.length) {
      res.status(400).send({ errorsMessages });
      return;
    }

    const { title, author, availableResolutions } = req.body as Video;
    const currentDate = new Date();

    const newVideo: Video = {
      id: Number(currentDate),
      title,
      author,
      availableResolutions,
      createdAt: currentDate.toISOString(),
      publicationDate: currentDate.toISOString(),
      minAgeRestriction: null,
      canBeDownloaded: false,
    };

    videos.push(newVideo);
    res.status(201).send(newVideo);
  }
);

videosRouter.put("/:id", (req: Request, res: Response) => {
  const video = videos.find((p) => p.id === Number(req.params.id));

  if (!video) {
    res.send(404);
    return;
  }

  const errorsMessages = checkVideoError(req.body);

  if (errorsMessages.length) {
    res.status(400).send({ errorsMessages });
    return;
  }

  Object.assign(video, req.body);

  res.send(204);
});

videosRouter.delete("/:id", (req: Request, res: Response) => {
  const index = videos.findIndex(
    (video) => video.id === Number(req.params.id)
  );

  if (index !== -1) {
    videos.splice(index, 1);
    res.send(204);
    return;
  }

  res.send(404);
});
