// api/race/route.ts
export async function GET(req: Request) {
  const url = new URL(req.url)
  const raceId = url.searchParams.get("raceId")

  if (!raceId) {
    return new Response("レースIDが必要です", { status: 400 })
  }

  // 実際のAPIでは、レースIDに基づいてデータベースやAPIからデータを取得します
  // ここではサンプルのHTMLテーブルを返します
  const htmlTable = `
    <table class="race-table">
      <thead>
        <tr>
          <th>枠番</th>
          <th>馬番</th>
          <th>馬名</th>
          <th>性齢</th>
          <th>斤量</th>
          <th>騎手</th>
          <th>オッズ</th>
          <th>人気</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>1</td>
          <td>1</td>
          <td>ウマノホシ</td>
          <td>牡4</td>
          <td>56.0</td>
          <td>武豊</td>
          <td>3.5</td>
          <td>1</td>
        </tr>
        <tr>
          <td>2</td>
          <td>2</td>
          <td>ダートキング</td>
          <td>牡5</td>
          <td>57.0</td>
          <td>福永祐一</td>
          <td>4.2</td>
          <td>2</td>
        </tr>
        <tr>
          <td>3</td>
          <td>3</td>
          <td>スピードスター</td>
          <td>牝4</td>
          <td>54.0</td>
          <td>川田将雅</td>
          <td>6.8</td>
          <td>3</td>
        </tr>
        <tr>
          <td>4</td>
          <td>4</td>
          <td>グランドチャンプ</td>
          <td>セ6</td>
          <td>56.0</td>
          <td>ルメール</td>
          <td>8.5</td>
          <td>4</td>
        </tr>
        <tr>
          <td>5</td>
          <td>5</td>
          <td>ミラクルホース</td>
          <td>牡3</td>
          <td>54.0</td>
          <td>デムーロ</td>
          <td>12.4</td>
          <td>5</td>
        </tr>
        <tr>
          <td>6</td>
          <td>6</td>
          <td>ダービードリーム</td>
          <td>牡4</td>
          <td>56.0</td>
          <td>松山弘平</td>
          <td>18.6</td>
          <td>6</td>
        </tr>
        <tr>
          <td>7</td>
          <td>7</td>
          <td>エースランナー</td>
          <td>牝5</td>
          <td>55.0</td>
          <td>岩田康誠</td>
          <td>25.3</td>
          <td>7</td>
        </tr>
        <tr>
          <td>8</td>
          <td>8</td>
          <td>ウィナーズサークル</td>
          <td>牡6</td>
          <td>57.0</td>
          <td>池添謙一</td>
          <td>32.1</td>
          <td>8</td>
        </tr>
      </tbody>
    </table>
    <style>
      .race-table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 1rem;
      }
      .race-table th, .race-table td {
        border: 1px solid #ddd;
        padding: 8px;
        text-align: center;
      }
      .race-table th {
        background-color: #f2f2f2;
        color: #333;
      }
      .race-table tr:nth-child(even) {
        background-color: #f9f9f9;
      }
      .race-table tr:hover {
        background-color: #f5f5f5;
      }
    </style>
  `

  return new Response(htmlTable, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
  })
}

