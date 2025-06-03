import { auth } from "@/auth";
import ProfileLink from "@/components/user/ProfileLink";
import UserAvatar from "@/components/UserAvatar";
import { getUser, getUserQuestions } from "@/lib/actions/user.action";
import { RouteParams } from "@/types/global";
import { notFound } from "next/navigation";
import dayjs from "dayjs";
import Link from "next/link";
import ROUTES from "@/constants/routes";
import { Button } from "@/components/ui/button";
import Stats from "@/components/user/Stats";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DataRenderer from "@/components/DataRenderer";
import { EMPTY_QUESTION } from "@/constants/states";
import QuestionCard from "@/components/cards/QuestionCard";
import Pagination from "@/components/Pagination";

const Profile = async ({ params, searchParams }: RouteParams) => {
  const { id } = await params;
  const { page, pageSize } = await searchParams;

  if (!id) return notFound();
  const loggedInUser = await auth();
  const { success, data, error } = await getUser({ userId: id });

  if (!success || !data) {
    return (
      <div>
        <div className="h1_bold text-dark100_light900">{error?.message}</div>
      </div>
    );
  }

  const { user, totalQuestions, totalAnswers } = data;
  const {
    success: userQuestionsSuccess,
    data: userQuestionsData,
    error: userQuestionsError,
  } = await getUserQuestions({
    userId: id,
    page: Number(page) || 1,
    pageSize: Number(pageSize) || 2,
  });

  const { questions, isNext: hasMoreQuestions } = userQuestionsData || {};

  return (
    <>
      <section className="flex flex-col-reverse items-start justify-between sm:flex-row">
        <div className="flex flex-col items-start gap-4 lg:flex-row">
          <UserAvatar
            id={user._id}
            name={user.name}
            imageUrl={user.image}
            className="size-[140px] rounded-full"
            fallbackClassName="text-6xl font-bolder"
          />

          <div className="mt-3">
            <h2 className="h2_bold text-dark100_light900">{user.name}</h2>
            <p className="paragraph-regular text-dark200_light800">
              @{user.username}
            </p>

            <div className="mt-5 flex flex-wrap items-center justify-start gap-5">
              {user.portfolio && (
                <ProfileLink
                  imgUrl="/icons/link.svg"
                  href={user.portfolio}
                  title="portfolio"
                />
              )}
              {user.location && (
                <ProfileLink
                  imgUrl="/icons/location.svg"
                  href={user.location}
                  title="location"
                />
              )}

              <ProfileLink
                imgUrl="/icons/calendar.svg"
                title={dayjs(user.createdAt).format("MMMM YYYY")}
              />

              {user.bio && (
                <p className="paragraph-regular text-dark400_light800">
                  {user.bio}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end max-sm:mb-5 max-sm:w-full sm:mt-3">
          {loggedInUser?.user?.id === user._id && (
            <Link href={ROUTES.PROFILE(user._id) + "/edit"}>
              <Button className="paragraph-medium btn-secondary text-dark300_light900 min-h-12 min-w-44 px-4 py-2">
                Edit Profile
              </Button>
            </Link>
          )}
        </div>
      </section>
      <Stats
        totalQuestions={totalQuestions}
        totalAnswers={totalAnswers}
        badges={{ GOLD: 0, SILVER: 0, BRONZE: 0 }}
      />

      <section className="mt-10 flex gap-10">
        <Tabs defaultValue="top-posts" className="flex-[2]">
          <TabsList className="background-light800  _dark400 min-h-[42px] p-1">
            <TabsTrigger value="top-posts" className="tab">
              Top Posts
            </TabsTrigger>
            <TabsTrigger value="answers" className="tab">
              Answers
            </TabsTrigger>
          </TabsList>
          <TabsContent
            value="top-posts"
            className="mt-5 flex w-full flex-col gap-6"
          >
            <DataRenderer
              data={questions}
              success={userQuestionsSuccess}
              error={userQuestionsError}
              empty={{
                title: EMPTY_QUESTION.title,
                message: EMPTY_QUESTION.message,
              }}
              render={(questions) => (
                <div className="flex w-full flex-col gap-6">
                  {questions.map((question) => (
                    <QuestionCard key={question._id} question={question} />
                  ))}
                </div>
              )}
            />
            <Pagination page={page} isNext={hasMoreQuestions || false} />
          </TabsContent>
          <TabsContent value="answers" className="flex w-full flex-col gap-6">
            List of answers
          </TabsContent>
        </Tabs>

        <div className="flex w-full min-w-[250px] flex-1 flex-col mx-lg:hidden">
          <h3 className="h3-bold text-dark200_light900">Top Tech</h3>
          <div className="mt-7 flex flex-col gap-4">
            <p>List of tags</p>
          </div>
        </div>
      </section>
    </>
  );
};

export default Profile;
