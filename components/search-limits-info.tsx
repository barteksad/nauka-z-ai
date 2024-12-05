"use client"

import { useSupabase } from "@/app/supabase-provider";
import { getUserProductAndLimits, isAdmin } from "@/lib/actions";
import { Tables } from "@/supabase/types_db";

import { useEffect, useState } from "react";

export default function SearchLimitsInfo({
  examID,
}: {
  examID: string | null;
}) {
  const { supabase } = useSupabase();

  const [limitsInfo, setLimitsInfo] = useState<{
    productId: string | null;
    userLimits: Tables<"usage_limits">;
  } | null>(null);
  const [renderList, setRenderList] = useState<JSX.Element[]>([]);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const limitsInfo = await getUserProductAndLimits(supabase);
      const isAdminUser = await isAdmin(supabase);
      setLimitsInfo(limitsInfo);
      setIsAdminUser(isAdminUser);
      setLoading(false);
    }
    fetchData();
  }, [examID, supabase]);

  useEffect(() => {
    const renderListAcc: JSX.Element[] = [];

    if (isAdminUser) {
      renderListAcc.push(<p key="admin">Admin user</p>);
    } else if (!limitsInfo && !loading) {
      renderListAcc.push(
        <p key="error">Error fetching limits, pleas try again in a moment.</p>
      );
    } else if (limitsInfo && !loading) {
      console.log(limitsInfo);
      const limitKey = `${limitsInfo.productId}${limitsInfo.userLimits.free_count}${limitsInfo.userLimits.monthly_count}`;
      if (!limitsInfo.productId && limitsInfo.userLimits.free_count) {
        renderListAcc.push(
          <p key={`free-${limitKey}`}>
            Free exams left:{" "}
            {limitsInfo.userLimits.free_count}
          </p>
        );
      } else if (limitsInfo.userLimits.monthly_count) {
        renderListAcc.push(
          <p key={`weekly-${limitKey}`}>
            Monthly exams left:{" "}
            {limitsInfo.userLimits.monthly_count}
          </p>
        );
      }
      else {
        renderListAcc.push(
          <p key={`no-limits`}>
            Limits reached, please upgrade your plan.
          </p>
        );
      }
    }

    setRenderList(renderListAcc);
  }, [limitsInfo, isAdminUser, loading]);
  console.log(limitsInfo);
  return (
    <div className="flex flex-col text-black dark:text-white text-sm font-bold items-center">
      {loading ? <p>Loading limits...</p> : renderList}
    </div>
  );
}
