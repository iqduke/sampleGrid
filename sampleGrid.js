/**
需要自己写回调方法team_callback
eg:
 <table class="table table-tc">
            <thead class="thead1">
                <tr>
                    <td>序号</td>
                    <td>姓名</td>
                    <td>岗位名称 </td>
                    <td>职级</td>
                    <td>来源</td>
                    <td>学历</td>
                    <td>专业</td>
                    <td>司龄(年)</td>
                </tr>
            </thead>
            <tbody id="team"></tbody>
        </table>
        只针对tbody写入
   setTableData({
                url: '@Url.Action("GetProTeam", "Team")',
                elementId: "#team",
                ajaxType: "POST",
                queryParams: { "ProjectID": "@ViewBag.ProjectID" },
            }, team_callback);

  function team_callback(objId, result)
        {
            var rows = result.Data;
            var obj = $(objId);
            for (var i = 0; i < rows.length; i++)
            {
                var r = $("<tr><td>" +
                    (i + 1) + "</td><td>" +
                    rows[i].EmpName + "</td><td>" +
                    rows[i].PositionName + "</td><td>" +
                    (rows[i].PositionLevel == "-1" ? "" : rows[i].PName) + "</td><td>" +
                    (rows[i].Source == "-1" ? "" : rows[i].SName) + "</td><td>" +
                    (rows[i].Education == "-1" ? "" : rows[i].EName) + "</td><td>" +
                    rows[i].Profession + "</td><td>" +
                    rows[i].Seniority + "</td></tr>");
                obj.append(r);
            }
        }

*/
function setTableData(objParam, callback)
{
    var type = objParam.ajaxType;
    var url = objParam.url;
    var urlParam = objParam.queryParams;
    //参数列表
    if (Object.keys(urlParam).length > 0)
    {
        url += "?t=1";
        for (k in urlParam)
        {
            url += "&" + k + "=" + urlParam[k];
        }
    }
    $.ajax({
        url: url,
        type: type,
        success: function (result)
        {
            callback(objParam.elementId, result);
        }
    });
}
/*
*   新样式下简单的Grid生成，table有固定格式
*  <table class="table table-tc" id="approvalLogList"></table>
*   调用方法：
            setTableGrid({
                url: '@Url.Action("ApprovalLogGridList", "ApprovalLog")',
                elementId: "#approvalLogList",
                tableClass: "table table-tc",
                headClass: "thead1",
                bodyClass: "",
                footClass: "page",
                rownumbers: true,
                pagination: true,
                ajaxType: "POST",
                pageIndex: 1,
                pageSize: 10,
                queryParams: { "formID": "@ViewBag.ProjectID" },
                columns: [
                    { field: 'NodeName', title: '节点名称', width: 70 },
                    { field: 'ApprovalContent', title: '处理意见', width: 70 },
                    {
                        field: 'ApprovalUser', title: '操作人', width: 70
                    },
                    {
                        field: 'ApprovalDate', title: '操作时间', width: 70, formatter: function (value, row)
                        {
                            value = value || "";
                            return getDateTime(value);
                        }
                    },
                    {
                        field: 'ApprovalState', title: '操作', width: 70, formatter: function (value, row)
                        {
                            return ApprovalNameDict.getApprovalStateName(value);
                        }
                    },
                    {
                        field: 'TaskID', title: '附件', width: 70, formatter: function (value, row)
                        {
                            return GetDocList(row.TaskID);
                        }
                    }
                ]
            });
*/
function setTableGrid(objParam)
{
    var columnLen = objParam.columns.length;
    if (objParam.rownumbers)
    {
        columnLen += 1;
    }
    var type = objParam.ajaxType;
    var url = objParam.url;
    var urlParam = objParam.queryParams;
    //参数列表
    if (Object.keys(urlParam).length > 0)
    {
        url += "?t=1";
        for (k in urlParam)
        {
            url += "&" + k + "=" + urlParam[k];
        }
    }
    //翻页的参数加入到url中
    if (objParam.pagination)
    {
        //page
        url += "&page=" + objParam.pageIndex;
        //row
        url += "&row=" + objParam.pageSize;
    }

    //元素
    var obj = $(objParam.elementId);

    $.ajax({
        url: url,
        type: type,
        success: function (result)
        {
            //清空元素
            obj.empty();
            //如果为undefined则直接返回
            if (result == undefined)
            {
                return;
            }

            var colgroupArr = [];
            var theadArr = [];
            var tbodyArr = [];
            var tFormatArr = [];
            //如果显示行号
            if (objParam.rownumbers)
            {
                colgroupArr.push("5%");
                theadArr.push("序号");
                tbodyArr.push("###");
                tFormatArr.push(undefined);
            }
            for (var c in objParam.columns)
            {
                var item = objParam.columns[c];
                colgroupArr.push(item["width"]);
                theadArr.push(item["title"]);
                tbodyArr.push(item["field"]);
                tFormatArr.push(item["formatter"]);
            }
            //准备colgroup
            var colgStr = "<colgroup>###</colgroup>";
            var col = "";
            for (var cg in colgroupArr)
            {
                col += '<col style="width: ' + colgroupArr[cg] + ';">';
            }
            colgStr = colgStr.replace("###", col);

            obj.append($(colgStr));
            //准备thead
            var theadStr = '<thead class="' + objParam.headClass + '">###</thead>';
            var tr = "<tr>";
            for (var th in theadArr)
            {
                tr += "<td>" + theadArr[th] + "</td>";
            }
            tr += "</tr>";
            theadStr = theadStr.replace("###", tr);
            obj.append($(theadStr));
            //准备tbody
            var tbodyStr = "<tbody>###</tbody>";
            var tbd = "";
            var jData = JSON.parse(result);
            var total = jData.total;
            var rows = jData.rows;
            //如果返回结果为空,提示：很抱歉，未找到符合条件的记录！

            for (var i = 0; i < rows.length; i++)
            {
                var r = "<tr>";

                for (var tbr in tbodyArr)
                {
                    var tbItem = tbodyArr[tbr];
                    var cb = tFormatArr[tbr];
                    if (tbItem == "###")
                    {
                        r += "<td>" + (i + 1 + objParam.pageSize * (objParam.pageIndex - 1)) + "</td>";
                    } else
                    {
                        var rValue = rows[i][tbItem];
                        if (cb != undefined && typeof (cb) == "function")
                        {
                            rValue = cb(rValue, rows[i]);
                        }

                        r += "<td>" + rValue + "</td>";
                    }
                }
                r += "</tr>";
                tbd += r;
            }
            tbodyStr = tbodyStr.replace("###", tbd);
            obj.append($(tbodyStr));
            //准备tfoot
            var tfootStr = "<tfoot class=" + objParam.footClass + ">###</tfoot>";
            var page = parseInt(total / objParam.pageSize) + 1;
            var showPage = objParam.pageIndex + 4;
            var minPage = objParam.pageIndex - 5;
            var showCurrentPage = showPage > page ? page : showPage;
            var showMinPage = minPage < 1 ? 1 : minPage;
            var pageRow = '<tr><td colspan="' + columnLen + '"><a href="javascript:void(0)">首页</a><a href="javascript:void(0)">上一页</a>';
            for (var j = showMinPage; j <= showCurrentPage; j++)
            {
                if (j == objParam.pageIndex)
                {
                    pageRow += '<a href="javascript:void(0)" class="active">' + j + '</a>';
                } else
                {
                    pageRow += '<a href="javascript:void(0)">' + j + '</a>';
                }
            }

            pageRow += '<a href="javascript:void(0)">下一页</a><a href="javascript:void(0)">尾页</a><a href="javascript:void(0)" class="fresh">刷新</a</td><tr>';
            tfootStr = tfootStr.replace("###", pageRow);
            var tfootObject = $(tfootStr);
            obj.append(tfootObject);
            tfootObject.find("a").bind("click", function ()
            {
                var page1 =  $(this).html();
                var activePage = parseInt($(this).parent().find('a.active').html());
                var pageIndex;

                if (page1 == "首页")
                {
                    pageIndex = 1;
                } else if (page1 == "上一页")
                {
                    pageIndex = (activePage - 1) < 1 ? 1 : (activePage - 1);
                } else if (page1 == "下一页")
                {
                    pageIndex = (activePage + 1) > page ? page : (activePage + 1);
                } else if (page1 == "尾页")
                {
                    pageIndex = page;
                } else if (page1 == "刷新")
                {
                    pageIndex = 1;
                } else
                {
                    pageIndex = page1;
                }

                objParam.pageIndex = pageIndex;
                setTableGrid(objParam);
            });
        }
    });
}
