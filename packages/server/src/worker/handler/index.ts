import { mailWorker } from "./mail";
import { postsWorker } from "./posts";
import { slackWorker } from "./slack";

export default [mailWorker, postsWorker, slackWorker];
