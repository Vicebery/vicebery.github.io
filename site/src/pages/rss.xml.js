import rss from '@astrojs/rss';
import { getPublishedPosts, postUrl } from '../lib/posts';

export async function GET(context) {
  const posts = await getPublishedPosts();
  return rss({
    title: 'vicebery',
    description: 'vicebery 的技术笔记与随笔。',
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.date,
      description: post.data.description,
      link: postUrl(post),
    })),
  });
}
